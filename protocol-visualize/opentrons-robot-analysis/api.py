from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os

app = FastAPI()

ANALYZER_URL = os.environ.get("ANALYZER_URL", "http://localhost:32900")

class Protocol(BaseModel):
    protocol: str

@app.post("/analyze")
def analyze_protocol(protocol: Protocol):
    # This is a simplified proxy. In a real scenario, you might need
    # to handle different robot types (OT-2, Flex) and their
    # respective robot-server instances.
    try:
        # Assuming a single robot-server for simplicity
        response = requests.post(f"{ANALYZER_URL}/protocols", files={"files": ("protocol.py", protocol.protocol)})
        response.raise_for_status()
        protocol_id = response.json()["data"]["id"]

        analysis_response = requests.get(f"{ANALYZER_URL}/protocols/{protocol_id}/analyses/latest")
        analysis_response.raise_for_status()

        return analysis_response.json()

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.get("/robot/health")
def get_robot_health():
    # In a real implementation, this would check the health of
    # the OT-2 and Flex robot-server instances.
    return {"ok": True, "ot2": {"ok": True}, "flex": {"ok": True}}
