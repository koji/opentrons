from __future__ import annotations

import ast
import json
import shutil
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from .models import AnalyzerResponse, ErrorSummary, ProtocolRecord

SRC_DIRECTORY_NAME = "src"
ANALYSIS_DIRECTORY_NAME = "analysis"
METADATA_FILENAME = "metadata.json"


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


def to_iso(dt: datetime) -> str:
    return dt.isoformat().replace("+00:00", "Z")


def record_directory(storage_root: Path, protocol_id: str) -> Path:
    return storage_root / protocol_id


def metadata_path(storage_root: Path, protocol_id: str) -> Path:
    return record_directory(storage_root, protocol_id) / METADATA_FILENAME


def source_directory(storage_root: Path, protocol_id: str) -> Path:
    return record_directory(storage_root, protocol_id) / SRC_DIRECTORY_NAME


def analysis_directory(storage_root: Path, protocol_id: str) -> Path:
    return record_directory(storage_root, protocol_id) / ANALYSIS_DIRECTORY_NAME


def ensure_storage(storage_root: Path) -> None:
    storage_root.mkdir(parents=True, exist_ok=True)


def create_protocol_source(
    storage_root: Path, *, filename: str, source_text: str
) -> tuple[str, datetime]:
    protocol_id = str(uuid4())
    created_at = utc_now()
    src_dir = source_directory(storage_root, protocol_id)
    analysis_dir = analysis_directory(storage_root, protocol_id)
    src_dir.mkdir(parents=True, exist_ok=False)
    analysis_dir.mkdir(parents=True, exist_ok=True)
    (src_dir / filename).write_text(source_text, encoding="utf-8")
    return protocol_id, created_at


def parse_protocol_source_metadata(source_text: str) -> tuple[str | None, str | None]:
    try:
        module = ast.parse(source_text)
    except SyntaxError:
        return None, None

    metadata_value: dict[str, Any] | None = None
    requirements_value: dict[str, Any] | None = None

    for node in module.body:
        if not isinstance(node, ast.Assign):
            continue
        for target in node.targets:
            if not isinstance(target, ast.Name):
                continue
            if target.id == "metadata":
                try:
                    literal = ast.literal_eval(node.value)
                except Exception:
                    literal = None
                if isinstance(literal, dict):
                    metadata_value = literal
            if target.id == "requirements":
                try:
                    literal = ast.literal_eval(node.value)
                except Exception:
                    literal = None
                if isinstance(literal, dict):
                    requirements_value = literal

    author = metadata_value.get("author") if metadata_value is not None else None
    api_level = requirements_value.get("apiLevel") if requirements_value is not None else None
    if api_level is None and metadata_value is not None:
        api_level = metadata_value.get("apiLevel")

    return (
        str(author) if author not in (None, "") else None,
        str(api_level) if api_level not in (None, "") else None,
    )


def save_analysis_result(
    storage_root: Path,
    *,
    protocol_id: str,
    filename: str,
    created_at: datetime,
    source_text: str,
    analyzer_response: AnalyzerResponse,
) -> ProtocolRecord:
    updated_at = utc_now()
    analysis_timestamp = str(int(updated_at.timestamp() * 1000))
    analysis_file_name = f"{analysis_timestamp}.json"
    analysis_payload = analyzer_response.payload

    analysis_file_path = analysis_directory(storage_root, protocol_id) / analysis_file_name
    analysis_file_path.write_text(
        json.dumps(analysis_payload, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    author, api_level = parse_protocol_source_metadata(source_text)

    record = ProtocolRecord(
        id=protocol_id,
        filename=filename,
        uploadedAt=to_iso(created_at),
        updatedAt=to_iso(updated_at),
        analysisStatus="completed" if analyzer_response.ok else "failed",
        robotType=analyzer_response.robot_type if analyzer_response.ok else analyzer_response.robot_type,
        author=author,
        apiLevel=api_level,
        analysis=analysis_payload,
        errorSummary=build_error_summary(
            payload=analysis_payload,
            status_code=analyzer_response.status_code,
            ok=analyzer_response.ok,
        ),
    )

    metadata = record.model_dump(mode="json")
    metadata["analysisFile"] = analysis_file_name
    metadata_path(storage_root, protocol_id).write_text(
        json.dumps(metadata, indent=2, sort_keys=True),
        encoding="utf-8",
    )
    return record


def build_error_summary(
    *, payload: dict[str, Any], status_code: int, ok: bool
) -> ErrorSummary | None:
    if ok:
        if payload.get("errors"):
            errors = [
                error.get("detail", "Unknown analysis error")
                for error in payload.get("errors", [])
                if isinstance(error, dict)
            ]
            if errors:
                return ErrorSummary(
                    message="Protocol analysis completed with reported errors.",
                    status_code=status_code,
                    errors=errors,
                )
        return None

    errors: list[str] = []
    payload_errors = payload.get("errors")
    if isinstance(payload_errors, list):
        for error in payload_errors:
            if isinstance(error, dict):
                errors.append(str(error.get("detail", "Unknown analysis error")))
            else:
                errors.append(str(error))

    message = str(
        payload.get("detail")
        or payload.get("message")
        or payload.get("_non_json")
        or "Protocol analysis failed."
    )
    return ErrorSummary(message=message, status_code=status_code, errors=errors)


def load_protocol_record(storage_root: Path, protocol_id: str) -> ProtocolRecord:
    metadata = json.loads(metadata_path(storage_root, protocol_id).read_text(encoding="utf-8"))
    metadata.pop("analysisFile", None)
    if metadata.get("author") is None or metadata.get("apiLevel") is None:
        try:
            _filename, source_text = load_protocol_source(storage_root, protocol_id)
        except FileNotFoundError:
            source_text = ""
        author, api_level = parse_protocol_source_metadata(source_text)
        metadata["author"] = metadata.get("author") or author
        metadata["apiLevel"] = metadata.get("apiLevel") or api_level
    return ProtocolRecord.model_validate(metadata)


def list_protocol_records(storage_root: Path) -> list[ProtocolRecord]:
    ensure_storage(storage_root)
    records: list[ProtocolRecord] = []
    for protocol_dir in storage_root.iterdir():
        if not protocol_dir.is_dir():
            continue
        meta_file = protocol_dir / METADATA_FILENAME
        if not meta_file.exists():
            continue
        records.append(load_protocol_record(storage_root, protocol_dir.name))
    return sorted(records, key=lambda record: record.uploadedAt, reverse=True)


def load_protocol_source(storage_root: Path, protocol_id: str) -> tuple[str, str]:
    src_dir = source_directory(storage_root, protocol_id)
    source_files = sorted(path for path in src_dir.iterdir() if path.is_file())
    if not source_files:
        raise FileNotFoundError(f"No source file found for protocol {protocol_id}")
    source_file = source_files[0]
    return source_file.name, source_file.read_text(encoding="utf-8")


def delete_protocol_record(storage_root: Path, protocol_id: str) -> None:
    protocol_dir = record_directory(storage_root, protocol_id)
    if not protocol_dir.exists():
        raise FileNotFoundError(f"Protocol {protocol_id} not found")
    shutil.rmtree(protocol_dir)
