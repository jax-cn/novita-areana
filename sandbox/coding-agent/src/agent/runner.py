"""Claude Agent runner for executing coding tasks."""

import logging
import os
import sys
import time
from pathlib import Path
from typing import TYPE_CHECKING, Any

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    HookMatcher,
    ResultMessage,
    SystemMessage,
    TextBlock,
    ThinkingBlock,
    ToolResultBlock,
    ToolUseBlock,
)

from .hooks import AgentHooks
from ..models.events import AgentEvent, EventType

if TYPE_CHECKING:
    from ..main import Session


class AgentRunner:
    """Claude Agent runner for Next.js coding tasks."""

    def __init__(self, workdir: str, session: "Session"):
        self.workdir = workdir
        self.session = session
        self.system_prompt = self._load_system_prompt()

        self._configure_api()

    def _configure_api(self) -> None:
        """Configure Anthropic API environment variables."""
        os.environ["ANTHROPIC_BASE_URL"] = os.environ.get(
            "ANTHROPIC_BASE_URL", "https://api.novita.ai/anthropic"
        )
        os.environ["ANTHROPIC_API_KEY"] = os.environ.get("ANTHROPIC_AUTH_TOKEN", "")
        os.environ["ANTHROPIC_MODEL"] = os.environ.get(
            "ANTHROPIC_MODEL", ""
        )

    def _load_system_prompt(self) -> str:
        """Load system prompt from file."""
        prompt_file = Path(__file__).parent / "prompts" / "system_prompt.txt"
        return prompt_file.read_text()

    async def run(self, user_prompt: str) -> None:
        """Run Agent and store events to session."""
        start_time = time.time()

        # Send started event
        await self._emit_event(self._create_started_event(user_prompt))

        hooks = AgentHooks(self.session, self.workdir)
        options = self._create_agent_options(hooks)

        try:
            async with ClaudeSDKClient(options=options) as client:
                # Send the query
                await client.query(user_prompt)

                # Process all messages from Claude
                async for msg in client.receive_response():
                    # Then process the message based on its type
                    if isinstance(msg, AssistantMessage):
                        await self._process_assistant_message(msg)
                    elif isinstance(msg, ResultMessage):
                        await self._emit_event(self._create_result_event(msg))
                    elif isinstance(msg, SystemMessage):
                        await self._emit_event(self._create_system_event(msg))

        except Exception as e:
            logging.error(f"Agent execution error: {type(e).__name__}: {str(e)}", exc_info=True)
            await hooks.on_error(e)
            await self._emit_event(self._create_error_event(e))
            raise

        duration = time.time() - start_time
        logging.info(f"Agent completed in {duration:.2f}s")
        await self._emit_event(self._create_completed_event(duration))

    async def _emit_event(self, event: AgentEvent) -> None:
        """Emit event to session."""
        await self.session.add_event(event)

    def _create_started_event(self, user_prompt: str) -> AgentEvent:
        """Create the initial started event."""
        return AgentEvent(
            type=EventType.STARTED,
            timestamp=time.time(),
            data={
                "model": os.environ.get("ANTHROPIC_MODEL", "unknown"),
                "prompt": user_prompt,
                "workdir": self.workdir,
            },
        )

    def _create_agent_options(self, hooks: AgentHooks) -> ClaudeAgentOptions:
        """Create Claude Agent options."""
        return ClaudeAgentOptions(
            resume=None,
            system_prompt=self.system_prompt,
            cwd=self.workdir,
            setting_sources=["project"],
            allowed_tools=[
                "Read",
                "Write",
                "Edit",
                "Bash",
                "Glob",
                "Grep",
            ],
            permission_mode="bypassPermissions",
            hooks={
                "PreToolUse": [HookMatcher(matcher=None, hooks=[hooks.on_pre_tool_use])],
                "PostToolUse": [HookMatcher(matcher=None, hooks=[hooks.on_post_tool_use])],
            },
        )

    async def _process_assistant_message(self, msg: AssistantMessage) -> None:
        """Process an assistant message and emit events for all content blocks.

        Processes all content block types from Claude SDK:
        - TextBlock: Claude's text response to user
        - ThinkingBlock: Claude's internal thinking (extended thinking)
        - ToolUseBlock: Tool invocation request
        - ToolResultBlock: Tool execution result

        Note: PreToolUse/PostToolUse hooks are separate and captured via hooks.
        """
        for block in msg.content:
            if isinstance(block, TextBlock) and block.text:
                # Claude's text response to the user
                await self._emit_event(
                    AgentEvent(
                        type=EventType.TEXT,
                        timestamp=time.time(),
                        data={"text": block.text},
                    )
                )

            elif isinstance(block, ThinkingBlock) and block.thinking:
                # Claude's thinking process (extended thinking feature)
                await self._emit_event(
                    AgentEvent(
                        type=EventType.THINKING,
                        timestamp=time.time(),
                        data={"thinking": block.thinking},
                    )
                )

            elif isinstance(block, ToolUseBlock):
                # Tool being called (invocation request)
                await self._emit_event(
                    AgentEvent(
                        type=EventType.TOOL_USE,
                        timestamp=time.time(),
                        data={
                            "id": block.id,
                            "name": block.name,
                            "input": block.input,
                        },
                    )
                )

            elif isinstance(block, ToolResultBlock):
                # Result of tool execution
                await self._emit_event(
                    AgentEvent(
                        type=EventType.TOOL_RESULT,
                        timestamp=time.time(),
                        data={
                            "tool_use_id": block.tool_use_id,
                            "content": block.content,
                            "is_error": block.is_error,
                        },
                    )
                )

    def _create_error_event(self, error: Exception) -> AgentEvent:
        """Create an error event."""
        return AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={"message": str(error), "type": type(error).__name__},
        )

    def _create_completed_event(self, duration: float) -> AgentEvent:
        """Create a completion event."""
        return AgentEvent(
            type=EventType.COMPLETED,
            timestamp=time.time(),
            data={"success": True, "total_duration_ms": duration * 1000},
        )

    def _create_result_event(self, msg: ResultMessage) -> AgentEvent:
        """Create a result event from ResultMessage.

        ResultMessage contains final execution metadata including cost and usage.
        """
        return AgentEvent(
            type=EventType.RESULT,
            timestamp=time.time(),
            data={
                "subtype": msg.subtype,
                "duration_ms": msg.duration_ms,
                "duration_api_ms": msg.duration_api_ms,
                "is_error": msg.is_error,
                "num_turns": msg.num_turns,
                "session_id": msg.session_id,
                "total_cost_usd": msg.total_cost_usd,
                "usage": msg.usage,
                "result": msg.result,
            },
        )

    def _create_system_event(self, msg: SystemMessage) -> AgentEvent:
        """Create a system event from SystemMessage.

        SystemMessage contains system metadata.
        """
        return AgentEvent(
            type=EventType.SYSTEM,
            timestamp=time.time(),
            data={
                "subtype": msg.subtype,
                "data": msg.data,
            },
        )
