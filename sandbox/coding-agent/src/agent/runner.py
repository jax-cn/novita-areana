"""Claude Agent runner for executing coding tasks."""

import json
import logging
import os
import time
from asyncio import Queue
from pathlib import Path
from typing import AsyncIterator

from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient, HookMatcher, AssistantMessage, ResultMessage, TextBlock

from .hooks import AgentHooks
from ..models.events import AgentEvent, EventType


logger = logging.getLogger(__name__)
SESSIONS_FILE = Path("/data/sessions.json")


class AgentRunner:
    """Claude Agent runner for Next.js coding tasks."""

    def __init__(self, workdir: str, event_queue: Queue):
        self.workdir = workdir
        self.event_queue = event_queue
        self.session_file = SESSIONS_FILE

        # Configure Novita API
        os.environ["ANTHROPIC_BASE_URL"] = os.environ.get(
            "ANTHROPIC_BASE_URL", "https://api.novita.ai/anthropic"
        )
        os.environ["ANTHROPIC_API_KEY"] = os.environ.get("ANTHROPIC_AUTH_TOKEN", "")
        os.environ["ANTHROPIC_MODEL"] = os.environ.get(
            "ANTHROPIC_MODEL", "moonshotai/kimi-k2-instruct"
        )

        logger.info(f"🔧 AgentRunner initialized - Workdir: {workdir}, Model: {os.environ.get('ANTHROPIC_MODEL')}")
        logger.debug(f"🔑 API Base URL: {os.environ.get('ANTHROPIC_BASE_URL')}")
        logger.debug(f"🔑 API Key configured: {bool(os.environ.get('ANTHROPIC_API_KEY'))}")

        # Load System Prompt
        self.system_prompt = self._load_system_prompt()
        logger.debug(f"📝 System prompt loaded (length: {len(self.system_prompt)} chars)")

    def _load_system_prompt(self) -> str:
        """Load system prompt from file."""
        prompt_file = Path(__file__).parent / "prompts" / "system_prompt.txt"
        return prompt_file.read_text()

    def _load_session_id(self) -> str | None:
        """Load existing Session ID from file."""
        if not self.session_file.exists():
            logger.debug("💾 No existing session file found")
            return None
        try:
            sessions = json.loads(self.session_file.read_text())
            session_id = sessions.get("default")
            if session_id:
                logger.info(f"📂 Loaded existing session: {session_id}")
            return session_id
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"⚠️ Failed to load session file: {e}")
            return None

    def _save_session_id(self, session_id: str):
        """Save Session ID to file."""
        sessions = {}
        if self.session_file.exists():
            try:
                sessions = json.loads(self.session_file.read_text())
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"⚠️ Failed to read existing sessions: {e}")

        sessions["default"] = session_id
        self.session_file.parent.mkdir(parents=True, exist_ok=True)
        self.session_file.write_text(json.dumps(sessions, indent=2))
        logger.info(f"💾 Saved session ID: {session_id}")

    async def run(self, user_prompt: str) -> AsyncIterator[AgentEvent]:
        """Run Agent and stream events."""
        start_time = time.time()
        logger.info(f"🚀 Starting agent run - Prompt: {user_prompt[:100]}{'...' if len(user_prompt) > 100 else ''}")

        # Send started event
        event = AgentEvent(
            type=EventType.STARTED,
            timestamp=start_time,
            data={
                "model": os.environ.get("ANTHROPIC_MODEL", "unknown"),
                "prompt": user_prompt,
                "workdir": self.workdir,
            },
        )
        yield event

        # Create hooks
        hooks = AgentHooks(self.event_queue)

        # Load session
        session_id = self._load_session_id()

        # Configure Claude Agent
        options = ClaudeAgentOptions(
            resume=session_id,
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

        logger.info(f"📋 Agent configured - Max turns: 20, Allowed tools: Read, Write, Bash")

        try:
            logger.debug("🔌 Connecting to Claude Agent SDK...")
            async with ClaudeSDKClient(options=options) as client:
                # Send user prompt
                logger.debug("📤 Sending user prompt to agent")
                await client.query(user_prompt)

                # Receive response
                logger.debug("📥 Receiving agent response...")
                response_count = 0
                async for msg in client.receive_response():
                    response_count += 1
                    if response_count % 5 == 0:
                        logger.debug(f"📬 Received {response_count} messages so far...")

                    if isinstance(msg, ResultMessage) and hasattr(msg, "session_id"):
                        self._save_session_id(msg.session_id)

                    if isinstance(msg, AssistantMessage):
                        for block in msg.content:
                            if isinstance(block, TextBlock) and block.text:
                                event = AgentEvent(
                                    type=EventType.OUTPUT,
                                    timestamp=time.time(),
                                    data={"content": block.text},
                                )
                                yield event
                                logger.debug(f"💬 Text output: {len(block.text)} chars")

                logger.info(f"📬 Total messages received: {response_count}")

        except Exception as e:
            logger.error(f"💥 Agent execution failed: {type(e).__name__}: {str(e)}", exc_info=True)
            # Send error event
            await hooks.on_error(e)
            event = AgentEvent(
                type=EventType.ERROR,
                timestamp=time.time(),
                data={"message": str(e), "type": type(e).__name__},
            )
            yield event
            raise

        # Send completed event
        duration = time.time() - start_time
        event = AgentEvent(
            type=EventType.COMPLETED,
            timestamp=time.time(),
            data={"success": True, "total_duration_ms": duration * 1000},
        )
        logger.info(f"✅ Agent run completed successfully in {duration:.2f}s")
        yield event
