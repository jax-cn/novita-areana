"""Claude Agent SDK hooks for event streaming.

These hooks capture tool execution lifecycle events and emit them to the session.
Hook events are separate from message content blocks - they capture the execution
aspect (before/after with timing), while content blocks capture the data aspect.
"""

import time
from typing import TYPE_CHECKING

from claude_agent_sdk import HookContext, HookInput, HookJSONOutput

from ..models.events import AgentEvent, EventType

if TYPE_CHECKING:
    from ..main import Session


class AgentHooks:
    """Claude Agent event hooks for streaming via SSE.

    Emits events for:
    - PreToolUse: Before tool execution (with input)
    - PostToolUse: After tool execution (with output and duration)
    """

    def __init__(self, session: "Session", workdir: str):
        self.session = session
        self.workdir = workdir
        self.tool_start_time: dict[str, float] = {}

    async def on_pre_tool_use(
        self,
        input_data: HookInput,
        tool_use_id: str | None,
        context: HookContext,
    ) -> HookJSONOutput:
        """Hook called before tool execution.

        Emits pre_tool_use event with tool name and input.
        """
        tool_name = self._extract_tool_name(input_data)
        tool_input = self._extract_tool_input(input_data)

        self.tool_start_time[tool_name] = time.time()

        # Emit pre_tool_use event
        event = AgentEvent(
            type=EventType.PRE_TOOL_USE,
            timestamp=time.time(),
            data={
                "tool_name": tool_name,
                "tool_input": tool_input,
                "tool_use_id": tool_use_id,
            },
        )
        await self.session.add_event(event)

        return {}

    async def on_post_tool_use(
        self,
        input_data: HookInput,
        tool_use_id: str | None,
        context: HookContext,
    ) -> HookJSONOutput:
        """Hook called after tool execution.

        Emits post_tool_use event with tool response and duration.
        """
        tool_name = self._extract_tool_name(input_data)
        tool_input = self._extract_tool_input(input_data)
        tool_response = self._extract_tool_response(input_data)

        duration = time.time() - self.tool_start_time.get(tool_name, time.time())

        # Emit post_tool_use event
        event = AgentEvent(
            type=EventType.POST_TOOL_USE,
            timestamp=time.time(),
            data={
                "tool_name": tool_name,
                "tool_input": tool_input,
                "tool_response": tool_response,
                "tool_use_id": tool_use_id,
                "duration_ms": duration * 1000,
            },
        )
        await self.session.add_event(event)

        return {}

    async def on_error(self, error: Exception) -> None:
        """Hook called when an error occurs."""
        event = AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={"message": str(error), "type": type(error).__name__},
        )
        await self.session.add_event(event)

    def _extract_tool_name(self, input_data: HookInput) -> str:
        """Safely extract tool name from HookInput."""
        if isinstance(input_data, dict):
            return input_data.get("tool_name", "unknown")
        return "unknown"

    def _extract_tool_input(self, input_data: HookInput) -> dict:
        """Safely extract tool input from HookInput."""
        if isinstance(input_data, dict):
            return input_data.get("tool_input", {})
        return {}

    def _extract_tool_response(self, input_data: HookInput) -> str | None:
        """Safely extract tool response from HookInput."""
        if isinstance(input_data, dict):
            return input_data.get("tool_response")
        return None
