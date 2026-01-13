"""Event models for Agent SSE streaming."""

from enum import Enum
from typing import Any

from pydantic import BaseModel


class EventType(str, Enum):
    """Agent event types for SSE streaming."""

    # Lifecycle events
    STARTED = "started"
    THINKING = "thinking"
    COMPLETED = "completed"
    ERROR = "error"

    # Tool events
    TOOL_START = "tool_start"
    TOOL_END = "tool_end"
    TOOL_ERROR = "tool_error"

    # File operations
    FILE_READ = "file_read"
    FILE_WRITE = "file_write"

    # Output events
    OUTPUT = "output"

    # Debug events
    LINT_START = "lint_start"
    LINT_END = "lint_end"
    BUILD_START = "build_start"
    BUILD_END = "build_end"
    SERVE_START = "serve_start"
    SERVE_END = "serve_end"


class AgentEvent(BaseModel):
    """Base event model for Agent SSE streaming."""

    type: EventType
    timestamp: float
    data: dict[str, Any] = {}

    model_config = {"use_enum_values": True}
