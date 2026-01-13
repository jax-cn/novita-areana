"""Claude Agent runner for executing coding tasks."""

import asyncio
import logging
import os
import queue
import time
from asyncio import Queue
from pathlib import Path
from typing import AsyncIterator

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    HookMatcher,
    TextBlock,
)

from .hooks import AgentHooks
from ..models.events import AgentEvent, EventType


logger = logging.getLogger(__name__)


class AgentRunner:
    """Claude Agent runner for Next.js coding tasks."""

    def __init__(self, workdir: str, event_queue: Queue):
        self.workdir = workdir
        self.event_queue = event_queue
        self.system_prompt = self._load_system_prompt()

        self._configure_api()
        self._log_initialization()

    def _configure_api(self) -> None:
        """Configure Anthropic API environment variables."""
        os.environ["ANTHROPIC_BASE_URL"] = os.environ.get(
            "ANTHROPIC_BASE_URL", "https://api.novita.ai/anthropic"
        )
        os.environ["ANTHROPIC_API_KEY"] = os.environ.get("ANTHROPIC_AUTH_TOKEN", "")
        os.environ["ANTHROPIC_MODEL"] = os.environ.get(
            "ANTHROPIC_MODEL", "moonshotai/kimi-k2-instruct"
        )

    def _log_initialization(self) -> None:
        """Log initialization details."""
        model = os.environ.get("ANTHROPIC_MODEL")
        base_url = os.environ.get("ANTHROPIC_BASE_URL")
        has_api_key = bool(os.environ.get("ANTHROPIC_API_KEY"))

        logger.info(f"AgentRunner initialized - Workdir: {self.workdir}, Model: {model}")
        logger.debug(f"API Base URL: {base_url}")
        logger.debug(f"API Key configured: {has_api_key}")
        logger.debug(f"System prompt loaded (length: {len(self.system_prompt)} chars)")

    def _load_system_prompt(self) -> str:
        """Load system prompt from file."""
        prompt_file = Path(__file__).parent / "prompts" / "system_prompt.txt"
        return prompt_file.read_text()

    async def run(
        self, user_prompt: str, timeout_seconds: int = 300
    ) -> AsyncIterator[AgentEvent]:
        """Run Agent and stream events."""
        start_time = time.time()
        prompt_preview = self._truncate_prompt(user_prompt)

        logger.info(f"Starting agent run - Prompt: {prompt_preview}")

        yield self._create_started_event(user_prompt, timeout_seconds)

        hooks = AgentHooks(self.event_queue)
        options = self._create_agent_options(hooks)

        logger.info(f"Agent configured - Max turns: 20, Timeout: {timeout_seconds}s")

        try:
            async with asyncio.timeout(timeout_seconds):
                async with ClaudeSDKClient(options=options) as client:
                    logger.debug("Sending user prompt to agent")
                    await client.query(user_prompt)

                    logger.debug("Receiving agent response...")
                    response_count = 0

                    async for msg in client.receive_response():
                        response_count += 1
                        async for event in self._drain_event_queue():
                            yield event

                        if response_count % 5 == 0:
                            logger.debug(f"Received {response_count} messages so far")

                        if isinstance(msg, AssistantMessage):
                            async for event in self._process_assistant_message(msg):
                                yield event

                    async for event in self._drain_event_queue():
                        yield event
                    logger.info(f"Total messages received: {response_count}")

        except TimeoutError:
            logger.error(f"Agent execution timed out after {timeout_seconds}s")
            yield self._create_timeout_event(timeout_seconds)
            raise
        except Exception as e:
            logger.error(f"Agent execution failed: {type(e).__name__}: {str(e)}", exc_info=True)
            await hooks.on_error(e)
            yield self._create_error_event(e)
            raise

        duration = time.time() - start_time
        yield self._create_completed_event(duration)
        logger.info(f"Agent run completed successfully in {duration:.2f}s")

    def _truncate_prompt(self, prompt: str, max_length: int = 100) -> str:
        """Truncate prompt for logging."""
        if len(prompt) <= max_length:
            return prompt
        return f"{prompt[:max_length]}..."

    def _create_started_event(self, user_prompt: str, timeout: int) -> AgentEvent:
        """Create the initial started event."""
        return AgentEvent(
            type=EventType.STARTED,
            timestamp=time.time(),
            data={
                "model": os.environ.get("ANTHROPIC_MODEL", "unknown"),
                "prompt": user_prompt,
                "workdir": self.workdir,
                "timeout": timeout,
            },
        )

    def _create_agent_options(self, hooks: AgentHooks) -> ClaudeAgentOptions:
        """Create Claude Agent options."""
        return ClaudeAgentOptions(
            resume=None,
            system_prompt=self.system_prompt,
            cwd=self.workdir,
            setting_sources=["project"],
            allowed_tools=["Read", "Write", "Bash"],
            permission_mode="acceptEdits",
            max_turns=20,
            hooks={
                "PreToolUse": [HookMatcher(matcher=None, hooks=[hooks.on_pre_tool_use])],
                "PostToolUse": [HookMatcher(matcher=None, hooks=[hooks.on_post_tool_use])],
            },
        )

    async def _drain_event_queue(self) -> AsyncIterator[AgentEvent]:
        """Drain all pending events from the queue."""
        while not self.event_queue.empty():
            try:
                event = self.event_queue.get_nowait()
                yield event
            except queue.Empty:
                break

    async def _process_assistant_message(self, msg: AssistantMessage) -> AsyncIterator[AgentEvent]:
        """Process an assistant message and yield output events."""
        for block in msg.content:
            if isinstance(block, TextBlock) and block.text:
                logger.debug(f"Text output: {len(block.text)} chars")
                yield AgentEvent(
                    type=EventType.OUTPUT,
                    timestamp=time.time(),
                    data={"content": block.text},
                )

    def _create_timeout_event(self, timeout_seconds: int) -> AgentEvent:
        """Create a timeout error event."""
        return AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={
                "message": f"Agent execution timed out after {timeout_seconds}s",
                "type": "TimeoutError",
            },
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
