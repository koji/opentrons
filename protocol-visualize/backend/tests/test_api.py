from __future__ import annotations

from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import create_app
from app.models import AnalyzerResponse


class FakeAnalyzerClient:
    def __init__(self, response: AnalyzerResponse | None = None, *, error: Exception | None = None) -> None:
        self._response = response
        self._error = error

    def analyze(self, *, filename: str, protocol_text: str) -> AnalyzerResponse:
        if self._error is not None:
            raise self._error
        assert filename.endswith(".py")
        assert "protocol" in protocol_text
        assert self._response is not None
        return self._response


def make_client(tmp_path: Path, analyzer_response: AnalyzerResponse | None = None, *, error: Exception | None = None) -> TestClient:
    app = create_app(
        storage_root=tmp_path / "storage",
        analyzer_client=FakeAnalyzerClient(analyzer_response, error=error),
    )
    return TestClient(app)


def test_upload_protocol_persists_source_and_analysis(tmp_path: Path) -> None:
    client = make_client(
        tmp_path,
        AnalyzerResponse(
            ok=True,
            robot_type="flex",
            status_code=200,
            payload={
                "commands": [],
                "errors": [],
                "metadata": {"protocolName": "My Protocol"},
                "robotType": "Flex",
                "createdAt": "2026-03-15T12:00:00Z",
                "config": {"protocolType": "python", "apiVersion": [2, 20]},
                "liquids": [],
                "commandAnnotations": [],
            },
        ),
    )

    response = client.post(
        "/protocols",
        files={"file": ("example.py", b"protocol = 'test protocol'", "text/x-python")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["filename"] == "example.py"
    assert body["analysisStatus"] == "completed"
    assert body["robotType"] == "flex"

    protocol_id = body["id"]
    stored_source = tmp_path / "storage" / protocol_id / "src" / "example.py"
    assert stored_source.read_text(encoding="utf-8") == "protocol = 'test protocol'"

    list_response = client.get("/protocols")
    assert list_response.status_code == 200
    assert [record["id"] for record in list_response.json()] == [protocol_id]


def test_upload_protocol_persists_command_source_map(tmp_path: Path) -> None:
    source_map = {
        "command-1": {"line": 12, "startLine": 12, "endLine": 14},
        "command-2": {"line": 20, "startLine": 20, "endLine": 20},
    }
    client = make_client(
        tmp_path,
        AnalyzerResponse(
            ok=True,
            robot_type="flex",
            status_code=200,
            payload={
                "commands": [],
                "errors": [],
                "metadata": {},
                "robotType": "Flex",
                "createdAt": "2026-03-15T12:00:00Z",
                "config": {"protocolType": "python", "apiVersion": [2, 20]},
                "liquids": [],
                "commandAnnotations": [],
            },
            command_source_map=source_map,
        ),
    )

    response = client.post(
        "/protocols",
        files={"file": ("example.py", b"protocol = 'test protocol'", "text/x-python")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["commandSourceMap"] == source_map

    get_response = client.get(f"/protocols/{body['id']}")
    assert get_response.status_code == 200
    assert get_response.json()["commandSourceMap"] == source_map


def test_protocol_record_without_source_map_defaults_to_none(tmp_path: Path) -> None:
    client = make_client(
        tmp_path,
        AnalyzerResponse(
            ok=True,
            robot_type="ot2",
            status_code=200,
            payload={
                "commands": [],
                "errors": [],
                "metadata": {},
                "robotType": "OT-2 Standard",
                "createdAt": "2026-03-15T12:00:00Z",
                "config": {"protocolType": "python", "apiVersion": [2, 20]},
                "liquids": [],
                "commandAnnotations": [],
            },
        ),
    )

    response = client.post(
        "/protocols",
        files={"file": ("example.py", b"protocol = 'test protocol'", "text/x-python")},
    )

    assert response.status_code == 201
    assert response.json()["commandSourceMap"] is None


def test_upload_protocol_extracts_author_and_api_level_from_source(tmp_path: Path) -> None:
    client = make_client(
        tmp_path,
        AnalyzerResponse(
            ok=True,
            robot_type="flex",
            status_code=200,
            payload={
                "commands": [],
                "errors": [],
                "robotType": "Flex",
                "createdAt": "2026-03-15T12:00:00Z",
                "liquids": [],
                "commandAnnotations": [],
            },
        ),
    )

    source = b"""
from opentrons import protocol_api

metadata = {'author': 'Opentrons <protocols@opentrons.com>'}
requirements = {'robotType': 'Flex', 'apiLevel': '2.18'}

def run(protocol: protocol_api.ProtocolContext):
    pass
"""

    response = client.post(
        "/protocols",
        files={"file": ("example.py", source, "text/x-python")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["author"] == "Opentrons <protocols@opentrons.com>"
    assert body["apiLevel"] == "2.18"


def test_upload_protocol_stores_failed_analysis_when_analyzer_reports_failure(
    tmp_path: Path,
) -> None:
    client = make_client(
        tmp_path,
        AnalyzerResponse(
            ok=False,
            robot_type="ot2",
            status_code=422,
            payload={"detail": "Syntax error", "errors": [{"detail": "Bad indent"}]},
        ),
    )

    response = client.post(
        "/protocols",
        files={"file": ("broken.py", b"protocol = 'bad protocol'", "text/x-python")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["analysisStatus"] == "failed"
    assert body["errorSummary"]["message"] == "Syntax error"
    assert body["errorSummary"]["errors"] == ["Bad indent"]


def test_upload_protocol_rejects_non_python_files(tmp_path: Path) -> None:
    client = make_client(
        tmp_path,
        AnalyzerResponse(ok=True, robot_type="ot2", status_code=200, payload={}),
    )

    response = client.post(
        "/protocols",
        files={"file": ("example.json", b"{}", "application/json")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only .py protocol files are supported."


def test_upload_protocol_handles_analyzer_transport_failure(tmp_path: Path) -> None:
    client = make_client(tmp_path, error=RuntimeError("service unavailable"))

    response = client.post(
        "/protocols",
        files={"file": ("example.py", b"protocol = 'test protocol'", "text/x-python")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["analysisStatus"] == "failed"
    assert body["errorSummary"]["message"] == "Analyzer request failed: service unavailable"


def test_protocol_source_endpoint_returns_source_text(tmp_path: Path) -> None:
    client = make_client(
        tmp_path,
        AnalyzerResponse(
            ok=True,
            robot_type="ot2",
            status_code=200,
            payload={
                "commands": [],
                "errors": [],
                "metadata": {},
                "robotType": "OT-2 Standard",
                "createdAt": "2026-03-15T12:00:00Z",
                "config": {"protocolType": "python", "apiVersion": [2, 20]},
                "liquids": [],
                "commandAnnotations": [],
            },
        ),
    )
    upload = client.post(
        "/protocols",
        files={"file": ("example.py", b"protocol = 'test protocol'", "text/x-python")},
    ).json()

    source_response = client.get(f"/protocols/{upload['id']}/source")

    assert source_response.status_code == 200
    assert source_response.text == "protocol = 'test protocol'"


def test_delete_protocol_removes_saved_record(tmp_path: Path) -> None:
    client = make_client(
        tmp_path,
        AnalyzerResponse(
            ok=True,
            robot_type="ot2",
            status_code=200,
            payload={
                "commands": [],
                "errors": [],
                "metadata": {},
                "robotType": "OT-2 Standard",
                "createdAt": "2026-03-15T12:00:00Z",
                "config": {"protocolType": "python", "apiVersion": [2, 20]},
                "liquids": [],
                "commandAnnotations": [],
            },
        ),
    )
    uploaded = client.post(
        "/protocols",
        files={"file": ("example.py", b"protocol = 'test protocol'", "text/x-python")},
    ).json()

    delete_response = client.delete(f"/protocols/{uploaded['id']}")
    list_response = client.get("/protocols")

    assert delete_response.status_code == 204
    assert list_response.status_code == 200
    assert list_response.json() == []
