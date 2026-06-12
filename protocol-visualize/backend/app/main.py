from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from .analyzer import AnalyzerClient, HttpAnalyzerClient
from .models import AnalyzerResponse, ProtocolRecord
from .storage import (
    create_protocol_source,
    delete_protocol_record,
    ensure_storage,
    list_protocol_records,
    load_protocol_record,
    load_protocol_source,
    save_analysis_result,
)

DEFAULT_STORAGE_ROOT = Path(__file__).resolve().parents[1] / "storage"


def create_app(
    *,
    storage_root: Path | None = None,
    analyzer_client: AnalyzerClient | None = None,
) -> FastAPI:
    app = FastAPI(title="Protocol Visualizer Backend", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.storage_root = storage_root or DEFAULT_STORAGE_ROOT
    app.state.analyzer_client = analyzer_client or HttpAnalyzerClient()
    ensure_storage(app.state.storage_root)

    @app.get("/health")
    def health() -> dict[str, bool]:
        return {"ok": True}

    @app.get("/protocols", response_model=list[ProtocolRecord])
    def get_protocols() -> list[ProtocolRecord]:
        return list_protocol_records(app.state.storage_root)

    @app.get("/protocols/{protocol_id}", response_model=ProtocolRecord)
    def get_protocol(protocol_id: str) -> ProtocolRecord:
        try:
            return load_protocol_record(app.state.storage_root, protocol_id)
        except FileNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.get("/protocols/{protocol_id}/source")
    def get_protocol_source(protocol_id: str) -> PlainTextResponse:
        try:
            _filename, source = load_protocol_source(app.state.storage_root, protocol_id)
        except FileNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error
        return PlainTextResponse(source)

    @app.delete("/protocols/{protocol_id}", status_code=204)
    def delete_protocol(protocol_id: str) -> None:
        try:
            delete_protocol_record(app.state.storage_root, protocol_id)
        except FileNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.post("/protocols", response_model=ProtocolRecord, status_code=201)
    async def upload_protocol(file: UploadFile = File(...)) -> ProtocolRecord:
        filename = file.filename or "protocol.py"
        if not filename.endswith(".py"):
            raise HTTPException(status_code=400, detail="Only .py protocol files are supported.")

        content = await file.read()
        try:
            protocol_text = content.decode("utf-8")
        except UnicodeDecodeError as error:
            raise HTTPException(status_code=400, detail="Protocol file must be UTF-8 encoded.") from error

        protocol_id, created_at = create_protocol_source(
            app.state.storage_root,
            filename=filename,
            source_text=protocol_text,
        )

        try:
            analyzer_response = app.state.analyzer_client.analyze(
                filename=filename,
                protocol_text=protocol_text,
            )
        except Exception as error:
            analyzer_response = AnalyzerResponse(
                ok=False,
                robot_type="ot2",
                status_code=503,
                payload={"detail": f"Analyzer request failed: {error}"},
            )

        return save_analysis_result(
            app.state.storage_root,
            protocol_id=protocol_id,
            filename=filename,
            created_at=created_at,
            source_text=protocol_text,
            analyzer_response=analyzer_response,
        )

    return app


app = create_app()
