# Coding Agent

FastAPI HTTP Server for Claude Agent SDK with Next.js + shadcn/ui development capabilities.

## Project Structure

```
sandbox/coding-agent/
├── pyproject.toml              # uv project configuration
├── uv.lock                    # dependency lock file
├── .env                        # Environment variables (create this)
├── src/
│   ├── main.py                 # FastAPI application
│   ├── agent/
│   │   ├── runner.py           # Claude Agent runner
│   │   ├── hooks.py            # Agent event hooks
│   │   └── prompts/
│   │       └── system_prompt.txt
│   ├── models/
│   │   └── events.py           # SSE event models
│   └── tools/
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
cd sandbox/coding-agent
uv sync
```

### 2. Configure Environment Variables

Create `.env` file:

```bash
ANTHROPIC_BASE_URL=https://api.novita.ai/anthropic
ANTHROPIC_AUTH_TOKEN=your-novita-api-key-here
ANTHROPIC_MODEL=moonshotai/kimi-k2-instruct
```

### 3. Run Development Server

```bash
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server starts at: `http://localhost:8000`

## API Endpoints

### GET /

Returns API information:

```json
{
  "name": "Coding Agent",
  "version": "0.1.0",
  "endpoints": {
    "POST /generate": "Generate code with Claude Agent",
    "GET /health": "Health check"
  }
}
```

### GET /health

Health check endpoint:

```json
{
  "status": "ok",
  "model": "moonshotai/kimi-k2-instruct"
}
```

### POST /generate

Generate code with Claude Agent via SSE streaming.

**Request:**

```json
{
  "prompt": "Add a hello world page",
  "workdir": "/path/to/nextjs/project"
}
```

**Response (SSE Stream):**

Events are streamed in real-time as Server-Sent Events (SSE):

```
data: {"type":"started","timestamp":1234567890.0,"data":{"model":"...","prompt":"..."}}
data: {"type":"tool_start","timestamp":1234567891.0,"data":{"tool":"Read","args":{...}}}
data: {"type":"file_read","timestamp":1234567892.0,"data":{"path":"..."}}
data: {"type":"tool_end","timestamp":1234567893.0,"data":{"tool":"Read","duration_ms":100,"success":true}}
data: {"type":"output","timestamp":1234567894.0,"data":{"content":"..."}}
data: {"type":"completed","timestamp":1234567895.0,"data":{"success":true,"total_duration_ms":5000}}
```

**SSE Headers:**
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`
- `X-Accel-Buffering: no` (prevents nginx buffering)

## Event Types

| Type | Description |
|-------|-------------|
| `started` | Agent started execution |
| `thinking` | Agent is processing |
| `tool_start` | Tool execution started |
| `tool_end` | Tool execution completed |
| `tool_error` | Tool execution failed |
| `file_read` | File read operation |
| `file_write` | File write operation |
| `output` | Claude text output |
| `error` | Error occurred |
| `completed` | Agent finished successfully |

## Development

### Type Checking

```bash
uv run pyright src/
```

### Linting

```bash
uv run ruff check src/
uv run ruff format src/
```

### Testing Endpoints

#### Health Check

```bash
curl http://localhost:8000/health
```

#### Testing SSE Streaming

```bash
http --ignore-stdin --stream --body POST http://localhost:8000/generate \
    prompt="Create a todo app" \
    workdir=/home/user/app | \
    grep --line-buffered "^data:" | \
    while IFS= read -r line; do
      echo "$line" | sed 's/^data: //' | jq -C 2>/dev/null || echo "$line"
    done
```

* Other prompts to test: Create a 3D simulation of a formula 1 car performing a continuous drifting donut in the street

#### Test in Docker

```bash
docker build -f sandbox/novita.Dockerfile -t novita-sandbox:test .
```

```bash
docker run --rm -d --name test-coding-agent -p 8000:8000 -p 3000:3000 \
    --env-file sandbox/coding-agent/.env \
    novita-sandbox:test
```

#### Build to sandbox

```bash
novita-sandbox-cli template build -c "uv run --directory /home/user/coding-agent uvicorn src.main:app --host 0.0.0.0 --port 8000" -n coding-agent-nextjs --cpu-count 2 --memory-mb 1024
```

## Architecture

- **FastAPI Server**: HTTP endpoints for health and code generation
- **Claude Agent SDK**: Core AI agent with tool capabilities
- **SSE Streaming**: Real-time event streaming to frontend via Server-Sent Events
- **Event System**: Hook-based event capture for tool usage, file operations, and agent lifecycle
- **asyncio.Queue**: Non-blocking event passing between hooks and runner
- **Novita API**: Anthropic-compatible API endpoint

### Event Flow

1. **PreToolUse Hook**: Captures tool start → puts event in queue
2. **Tool Execution**: Agent runs tool (Read/Write/Bash)
3. **PostToolUse Hook**: Captures tool result → puts event in queue
4. **Runner**: Drains queue and yields events via SSE to client
5. **Client**: Receives real-time events showing agent activity

## Next Steps

1. Set `ANTHROPIC_AUTH_TOKEN` with valid Novita API key
2. Test `/generate` endpoint with a test directory
3. Integrate with frontend for real-time event visualization
4. Extend allowed tools for specialized workflows (lint, build, serve)
5. Deploy to production environment

## License

MIT
