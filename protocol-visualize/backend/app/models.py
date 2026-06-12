from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


AnalysisStatus = Literal["completed", "failed"]
RobotType = Literal["ot2", "flex"]


class ErrorSummary(BaseModel):
    message: str
    status_code: int | None = None
    errors: list[str] = Field(default_factory=list)


class ProtocolRecord(BaseModel):
    id: str
    filename: str
    uploadedAt: str
    updatedAt: str
    analysisStatus: AnalysisStatus
    robotType: RobotType | None = None
    author: str | None = None
    apiLevel: str | None = None
    analysis: dict[str, Any]
    errorSummary: ErrorSummary | None = None
    # Maps protocol-engine command ids to the protocol source lines that
    # produced them: {commandId: {line, startLine, endLine}}. None for records
    # analyzed before this feature existed.
    commandSourceMap: dict[str, Any] | None = None


class AnalyzerResponse(BaseModel):
    ok: bool
    robot_type: RobotType
    status_code: int
    payload: dict[str, Any]
    command_source_map: dict[str, Any] | None = None
