from __future__ import annotations

import os
from typing import Protocol

import requests
from pydantic import ValidationError

from .models import AnalyzerResponse


class AnalyzerClient(Protocol):
    def analyze(self, *, filename: str, protocol_text: str) -> AnalyzerResponse: ...


class HttpAnalyzerClient:
    def __init__(self, base_url: str | None = None, timeout: float = 30.0) -> None:
        self._base_url = (
            base_url or os.getenv("ANALYZER_URL", "http://127.0.0.1:7860")
        ).rstrip("/")
        self._timeout = timeout

    def analyze(self, *, filename: str, protocol_text: str) -> AnalyzerResponse:
        response = requests.post(
            f"{self._base_url}/analyze",
            files={"file": (filename, protocol_text.encode("utf-8"), "text/x-python")},
            timeout=self._timeout,
        )
        payload = response.json()
        try:
            return AnalyzerResponse.model_validate(payload)
        except ValidationError:
            return AnalyzerResponse(
                ok=response.status_code < 400,
                robot_type="ot2",
                status_code=response.status_code,
                payload=payload if isinstance(payload, dict) else {"detail": str(payload)},
            )
