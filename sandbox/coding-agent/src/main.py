"""FastAPI server for Coding Agent with SSE streaming."""

import logging
import os
import time
from asyncio import Queue
from contextlib import asynccontextmanager
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.agent.runner import AgentRunner
from src.models.events import AgentEvent, EventType

# Load environment variables from .env (override system env vars)
load_dotenv(override=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class GenerateRequest(BaseModel):
    """Request model for /generate endpoint."""

    prompt: str
    workdir: str = "/project"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🚀 Coding Agent Server starting...")
    logger.info(
        f"📝 Configuration - Model: {os.getenv('ANTHROPIC_MODEL')}, Base URL: {os.getenv('ANTHROPIC_BASE_URL')}"
    )
    yield
    logger.info("👋 Coding Agent Server shutting down...")


app = FastAPI(
    title="Coding Agent",
    description="Claude Agent for Next.js + shadcn/ui development",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Coding Agent",
        "version": "0.1.0",
        "endpoints": {
            "POST /generate": "Generate code with Claude Agent",
            "GET /health": "Health check",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": os.environ.get("ANTHROPIC_MODEL")}


async def event_generator(runner: AgentRunner, prompt: str) -> AsyncIterator[str]:
    """SSE event generator with immediate flush."""
    event_count = 0

    logger.debug("🔌 SSE connection established")

    try:
        async for event in runner.run(prompt):
            event_count += 1
            # Log key events
            if event.type == "started":
                logger.info(f"🎬 Agent started - Model: {event.data.get('model')}")
            elif event.type == "completed":
                logger.info(
                    f"✅ Agent completed - Success: {event.data.get('success')}, Duration: {event.data.get('total_duration_ms')}ms, Events: {event_count}"
                )
            elif event.type == "error":
                logger.error(f"❌ Agent error: {event.data.get('message')}")
            elif event.type == "tool_start":
                logger.info(f"🔧 Tool started: {event.data.get('tool')}")
            elif event.type == "tool_end":
                duration = event.data.get("duration_ms", 0)
                success = event.data.get("success", False)
                status = "✅" if success else "❌"
                logger.info(
                    f"{status} Tool ended: {event.data.get('tool')} - Duration: {duration}ms"
                )
            elif event.type == "tool_error":
                logger.error(
                    f"🔨 Tool error: {event.data.get('tool')} - {event.data.get('error')}"
                )

            # Convert to SSE format and send immediately
            data = f"data: {event.model_dump_json()}\n\n"
            logger.debug(f"📤 Yielding event {event_count}: {event.type}")
            yield data
    except Exception as e:
        logger.error(
            f"💥 Unexpected error in event_generator: {type(e).__name__}: {str(e)}",
            exc_info=True,
        )
        # Send error event
        error_event = AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={"message": str(e), "type": type(e).__name__},
        )
        yield f"data: {error_event.model_dump_json()}\n\n"


@app.post("/generate")
async def generate(req: GenerateRequest):
    """Generate code endpoint with SSE streaming."""
    logger.info(
        f"📥 Received /generate request - Workdir: {req.workdir}, Prompt: {req.prompt[:100]}{'...' if len(req.prompt) > 100 else ''}"
    )

    # Validate workdir
    if not os.path.exists(req.workdir):
        logger.error(f"❌ Invalid workdir: {req.workdir}")
        raise HTTPException(
            status_code=400, detail=f"Workdir does not exist: {req.workdir}"
        )

    # Create event queue
    event_queue = Queue()

    # Create runner
    runner = AgentRunner(workdir=req.workdir, event_queue=event_queue)

    logger.info("✅ Starting code generation stream")
    # Return SSE stream with no buffering
    return StreamingResponse(
        event_generator(runner, req.prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import socket
    import uvicorn
    import sys

    # Check if port 8000 is already in use
    def is_port_in_use(port: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(("localhost", port)) == 0

    if is_port_in_use(8000):
        logger.error(
            "❌ Port 8000 is already in use. Please free the port or use a different port."
        )
        logger.error(
            "💡 Tip: Run 'lsof -ti:8000 | xargs kill -9' to kill the process using port 8000"
        )
        sys.exit(1)

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
