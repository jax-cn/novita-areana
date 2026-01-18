"""FastAPI server for Coding Agent with SSE streaming."""

import asyncio
import logging
import os
import socket
import subprocess
import sys
import time
import uuid
from contextlib import asynccontextmanager
from typing import Literal

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

from src.agent.runner import AgentRunner
from src.models.events import AgentEvent, EventType


load_dotenv(override=False)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ========== Session Management ==========


class Session:
    """Represents a single agent generation session."""

    def __init__(self, prompt: str, workdir: str):
        self.id = f"sess-{uuid.uuid4().hex[:12]}"
        self.prompt = prompt
        self.workdir = workdir
        self.status: Literal["running", "completed", "error"] = "running"
        self.created_at = time.time()
        self.events: list[AgentEvent] = []
        self._task: asyncio.Task | None = None
        self._lock = asyncio.Lock()

    async def add_event(self, event: AgentEvent) -> None:
        """Thread-safe event addition."""
        async with self._lock:
            self.events.append(event)

    def get_events_copy(self) -> list[AgentEvent]:
        """Get a copy of all events for replay."""
        return list(self.events)

    def set_task(self, task: "asyncio.Task") -> None:
        """Set the background task for this session."""
        self._task = task

    async def wait_for_completion(self) -> None:
        """Wait for the background task to complete."""
        if self._task:
            await self._task


# Global session (only one active session at a time)
_active_session: Session | None = None
_session_lock = asyncio.Lock()


async def get_or_create_session(prompt: str, workdir: str) -> Session:
    """Get existing running session or create a new one."""
    global _active_session

    async with _session_lock:
        # Check if there's an active running session
        if _active_session is not None and _active_session.status == "running":
            logger.info(f"Returning existing session: {_active_session.id}")
            return _active_session

        # Create new session
        logger.info("Creating new session")
        session = Session(prompt=prompt, workdir=workdir)
        _active_session = session
        return session


def get_session(session_id: str) -> Session | None:
    """Get a session by ID."""
    global _active_session
    if _active_session is not None and _active_session.id == session_id:
        return _active_session
    return None


# ========== Request/Response Models ==========


class GenerateRequest(BaseModel):
    """Request model for /generate endpoint."""

    prompt: str
    workdir: str = "/project"


class GenerateResponse(BaseModel):
    """Response model for /generate endpoint."""

    sessionId: str


class DeployResponse(BaseModel):
    """Response model for /deploy endpoint."""

    vercelUrl: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    model = os.getenv("ANTHROPIC_MODEL")
    base_url = os.getenv("ANTHROPIC_BASE_URL")

    logger.info("Coding Agent Server starting...")
    logger.info(f"Configuration - Model: {model}, Base URL: {base_url}")
    yield
    logger.info("Coding Agent Server shutting down...")


app = FastAPI(
    title="Coding Agent",
    description="Claude Agent for Next.js + shadcn/ui development",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware to allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Accept",
        "Accept-Language",
        "Accept-Encoding",
        "Cache-Control",
        "Pragma",
        "text/event-stream",
        "*",
    ],
    expose_headers=["*"],
    max_age=86400,  # 24 hours
)

# Explicitly handle OPTIONS requests for preflight
@app.options("/generate")
async def options_generate():
    """Handle OPTIONS request for /generate endpoint."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            # Allow all common headers including SSE-specific ones
            "Access-Control-Allow-Headers": "Content-Type, Accept, Cache-Control, text/event-stream",
            "Access-Control-Max-Age": "86400",
        },
    )


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Coding Agent",
        "version": "0.1.0",
        "endpoints": {
            "POST /generate": "Start code generation (returns sessionId)",
            "GET /stream/{sessionId}": "SSE stream of generation events",
            "GET /health": "Health check",
            "POST /deploy": "Deploy to Vercel",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": os.environ.get("ANTHROPIC_MODEL")}


# ========== Background Task ==========


async def run_agent_in_background(session: Session) -> None:
    """Run the agent in background and store events to session."""
    runner = AgentRunner(workdir=session.workdir, session=session)
    try:
        await runner.run(session.prompt)
        session.status = "completed"
        logger.info(f"Session {session.id} completed successfully")
    except Exception as e:
        logger.error(f"Session {session.id} failed: {e}", exc_info=True)
        session.status = "error"
        # Add error event
        error_event = AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={"message": str(e), "type": type(e).__name__},
        )
        await session.add_event(error_event)


# ========== API Endpoints ==========


@app.post("/generate")
async def generate(req: GenerateRequest) -> GenerateResponse:
    """Start code generation (returns immediately).

    If a session is already running, returns the existing session ID.
    Otherwise, creates a new session and starts generation in background.
    """
    logger.info(f"Received /generate request - Workdir: {req.workdir}")

    if not os.path.exists(req.workdir):
        logger.error(f"Invalid workdir: {req.workdir}")
        raise HTTPException(status_code=400, detail=f"Workdir does not exist: {req.workdir}")

    session = await get_or_create_session(req.prompt, req.workdir)

    # If this is a new session (no task set), start background task
    if session._task is None:
        logger.info(f"Starting background task for session {session.id}")
        task = asyncio.create_task(run_agent_in_background(session))
        session.set_task(task)

    return GenerateResponse(sessionId=session.id)


@app.get("/stream/{session_id}")
async def stream_session(session_id: str):
    """SSE stream for session events.

    Replays all historical events (10ms delay each).
    If session is running, continues streaming live events.
    If session is completed, ends stream after replay.
    """
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")

    async def event_stream():
        # Replay historical events with 10ms delay
        for event in session.get_events_copy():
            yield f"data: {event.model_dump_json()}\n\n"
            await asyncio.sleep(0.01)  # 10ms delay

        # If session is still running, continue streaming live events
        if session.status == "running":
            last_index = len(session.events)
            while session.status == "running":
                # Check for new events
                while last_index < len(session.events):
                    event = session.events[last_index]
                    yield f"data: {event.model_dump_json()}\n\n"
                    last_index += 1
                await asyncio.sleep(0.1)  # Check for new events every 100ms

        logger.info(f"Stream ended for session {session_id}")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/deploy")
async def deploy() -> DeployResponse:
    """Deploy the generated app to Vercel.

    Runs `vercel deploy --prod --yes` in the working directory.
    Requires VERCEL_TOKEN environment variable.
    """
    vercel_token = os.environ.get("VERCEL_TOKEN")
    if not vercel_token:
        raise HTTPException(status_code=500, detail="VERCEL_TOKEN environment variable not set")

    global _active_session
    if _active_session is None:
        raise HTTPException(status_code=400, detail="No session exists. Generate code first.")

    workdir = _active_session.workdir

    logger.info(f"Starting Vercel deployment in {workdir}")

    try:
        # Set up environment with Vercel token
        env = os.environ.copy()
        env["VERCEL_TOKEN"] = vercel_token

        # Run vercel deploy command
        result = subprocess.run(
            ["vercel", "deploy", "--prod", "--yes"],
            cwd=workdir,
            capture_output=True,
            text=True,
            env=env,
            timeout=300,  # 5 minute timeout
        )

        if result.returncode != 0:
            logger.error(f"Vercel deployment failed: {result.stderr}")
            raise HTTPException(
                status_code=500,
                detail=f"Deployment failed: {result.stderr}",
            )

        # Extract deployment URL from stdout
        vercel_url = result.stdout.strip()
        logger.info(f"Deployment successful: {vercel_url}")

        return DeployResponse(vercelUrl=vercel_url)

    except subprocess.TimeoutExpired:
        logger.error("Vercel deployment timed out")
        raise HTTPException(status_code=500, detail="Deployment timed out after 5 minutes")
    except Exception as e:
        logger.error(f"Deployment error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Deployment error: {str(e)}")


def _is_port_in_use(port: int) -> bool:
    """Check if a port is already in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("localhost", port)) == 0


if __name__ == "__main__":
    if _is_port_in_use(8000):
        logger.error("Port 8000 is already in use. Please free the port or use a different port.")
        logger.error("Tip: Run 'lsof -ti:8000 | xargs kill -9' to kill the process using port 8000")
        sys.exit(1)

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
