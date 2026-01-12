"""Claude Agent SDK hooks for event streaming."""

import logging
import time
from claude_agent_sdk import HookContext, HookInput, HookJSONOutput

from ..models.events import AgentEvent, EventType


logger = logging.getLogger(__name__)


class AgentHooks:
    """Claude Agent event hooks for streaming via SSE."""

    def __init__(self, event_queue):
        self.event_queue = event_queue
        self.tool_start_time: dict[str, float] = {}
        logger.debug("🪝 AgentHooks initialized")

    async def on_pre_tool_use(
        self,
        input_data: HookInput,
        tool_use_id: str | None,
        context: HookContext,
    ) -> HookJSONOutput:
        """Hook called before tool execution."""
        # Safely extract data from HookInput
        tool_name = input_data.get("tool_name", "unknown") if isinstance(input_data, dict) else "unknown"
        tool_input = input_data.get("tool_input", {}) if isinstance(input_data, dict) else {}

        logger.debug(f"🔨 Pre-tool use: {tool_name}")

        # Track start time
        self.tool_start_time[tool_name] = time.time()

        # Create event
        event = AgentEvent(
            type=EventType.TOOL_START,
            timestamp=time.time(),
            data={
                "tool": tool_name,
                "args": tool_input,
            },
        )
        await self.event_queue.put(event)

        # Allow execution
        return {}

    async def on_post_tool_use(
        self,
        input_data: HookInput,
        tool_use_id: str | None,
        context: HookContext,
    ) -> HookJSONOutput:
        """Hook called after tool execution."""
        # Safely extract data from HookInput
        tool_name = input_data.get("tool_name", "unknown") if isinstance(input_data, dict) else "unknown"
        tool_input = input_data.get("tool_input", {}) if isinstance(input_data, dict) else {}
        tool_response = input_data.get("tool_response") if isinstance(input_data, dict) else None

        start_time = self.tool_start_time.get(tool_name, time.time())
        duration = time.time() - start_time

        logger.debug(f"✅ Post-tool use: {tool_name} (took {duration:.3f}s)")

        # Handle file operations specially
        if tool_name in ("Read", "Write"):
            file_path = tool_input.get("file_path") or tool_input.get("path")

            if tool_name == "Read":
                logger.info(f"📄 Read file: {file_path}")
                event = AgentEvent(
                    type=EventType.FILE_READ,
                    timestamp=time.time(),
                    data={"path": file_path},
                )
            else:
                # Write
                content = tool_input.get("content", "")
                logger.info(f"✏️  Write file: {file_path} ({len(content)} chars)")
                event = AgentEvent(
                    type=EventType.FILE_WRITE,
                    timestamp=time.time(),
                    data={"path": file_path, "size": len(content)},
                )
        else:
            # Generic tool end
            has_error = tool_response and "error" in str(tool_response).lower()
            if has_error:
                logger.warning(f"⚠️ Tool {tool_name} failed: {tool_response}")
            else:
                logger.debug(f"🔧 Tool {tool_name} succeeded")

            event = AgentEvent(
                type=EventType.TOOL_ERROR if has_error else EventType.TOOL_END,
                timestamp=time.time(),
                data={
                    "tool": tool_name,
                    "duration_ms": duration * 1000,
                    "success": not has_error,
                },
            )

        await self.event_queue.put(event)
        return {}

    async def on_error(self, error: Exception):
        """Hook called when an error occurs."""
        logger.error(f"❌ Hook error: {type(error).__name__}: {str(error)}")
        event = AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={
                "message": str(error),
                "type": type(error).__name__,
            },
        )
        await self.event_queue.put(event)
