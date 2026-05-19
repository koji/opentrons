import ast
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Opentrons Protocol Analyzer", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to a Python interpreter that has the opentrons package installed.
# Defaults to the robot-server dev venv in the monorepo.
_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_PYTHON = str(_REPO_ROOT / "robot-server" / ".venv" / "bin" / "python")
OPENTRONS_PYTHON = os.environ.get("OPENTRONS_PYTHON", _DEFAULT_PYTHON)


def _detect_robot_type(protocol_text: str) -> str:
    """Return 'flex' or 'ot2' by parsing the protocol source."""
    try:
        tree = ast.parse(protocol_text)
        for node in tree.body:
            if not isinstance(node, ast.Assign):
                continue
            for target in node.targets:
                if not isinstance(target, ast.Name) or target.id != "requirements":
                    continue
                literal = ast.literal_eval(node.value)
                if isinstance(literal, dict):
                    rt = literal.get("robotType", "")
                    if isinstance(rt, str) and rt.lower() in ("flex", "ot-3"):
                        return "flex"
    except Exception:
        pass
    return "ot2"


def _robot_type_from_analysis(analysis: dict[str, Any]) -> str:
    """Map opentrons-cli robotType string to 'flex' or 'ot2'."""
    rt = str(analysis.get("robotType", "")).lower()
    if "3" in rt or "flex" in rt:
        return "flex"
    return "ot2"


@app.post("/analyze")
async def analyze_protocol(file: UploadFile = File(...)) -> dict[str, Any]:
    content = await file.read()
    try:
        protocol_text = content.decode("utf-8")
    except UnicodeDecodeError:
        return {
            "ok": False,
            "robot_type": "flex",
            "status_code": 400,
            "payload": {"detail": "Protocol file must be UTF-8 encoded."},
        }

    filename = file.filename or "protocol.py"
    robot_type = _detect_robot_type(protocol_text)

    with tempfile.TemporaryDirectory() as tmp_dir:
        src_file = Path(tmp_dir) / filename
        out_file = Path(tmp_dir) / "analysis.json"

        src_file.write_bytes(content)

        try:
            proc = subprocess.run(
                [
                    OPENTRONS_PYTHON,
                    "-m", "opentrons.cli",
                    "analyze",
                    "--json-output", str(out_file),
                    str(src_file),
                ],
                capture_output=True,
                timeout=180,
            )
        except FileNotFoundError:
            return {
                "ok": False,
                "robot_type": robot_type,
                "status_code": 503,
                "payload": {
                    "detail": (
                        f"Opentrons Python not found at {OPENTRONS_PYTHON}. "
                        "Set OPENTRONS_PYTHON env var to a Python with opentrons installed."
                    )
                },
            }
        except subprocess.TimeoutExpired:
            return {
                "ok": False,
                "robot_type": robot_type,
                "status_code": 504,
                "payload": {"detail": "Analysis timed out after 180 seconds."},
            }

        if not out_file.exists():
            stderr = proc.stderr.decode("utf-8", errors="replace")[-2000:]
            return {
                "ok": False,
                "robot_type": robot_type,
                "status_code": 500,
                "payload": {"detail": f"Analyzer produced no output.\n{stderr}"},
            }

        try:
            analysis = json.loads(out_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            return {
                "ok": False,
                "robot_type": robot_type,
                "status_code": 500,
                "payload": {"detail": f"Analyzer output was not valid JSON: {exc}"},
            }

    robot_type = _robot_type_from_analysis(analysis)
    ok = analysis.get("result") == "ok"
    return {
        "ok": ok,
        "robot_type": robot_type,
        "status_code": 200,
        "payload": analysis,
    }


@app.get("/robot/health")
def get_robot_health() -> dict[str, Any]:
    resolved = shutil.which(OPENTRONS_PYTHON) or (
        OPENTRONS_PYTHON if Path(OPENTRONS_PYTHON).exists() else None
    )
    python_ok = resolved is not None
    return {
        "ok": python_ok,
        "analyzer": {"ok": python_ok, "python": OPENTRONS_PYTHON},
    }
