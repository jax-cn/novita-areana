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

## Logging

The server includes comprehensive logging for debugging and monitoring:

### Log Levels

- **INFO**: Server lifecycle, request/response, key events (tools, file ops)
- **DEBUG**: Detailed execution flow, message counts, internal states
- **WARNING**: Non-critical issues (e.g., session file read errors)
- **ERROR**: Failed operations, tool errors, exceptions

### Log Format

```
YYYY-MM-DD HH:MM:SS - module_name - LEVEL - message
```

### Example Logs

```
2026-01-12 21:27:00 - src.main - INFO - 🚀 Coding Agent Server starting...
2026-01-12 21:27:00 - src.main - INFO - 📝 Configuration - Model: deepseek/deepseek-v3.2
2026-01-12 21:27:05 - src.main - INFO - 📥 Received /generate request - Workdir: /project, Prompt: Add hello world...
2026-01-12 21:27:05 - src.agent.runner - INFO - 🚀 Starting agent run - Prompt: Add hello world...
2026-01-12 21:27:05 - src.agent.runner - INFO - 📋 Agent configured - Max turns: 20, Allowed tools: Read, Write, Bash
2026-01-12 21:27:06 - src.agent.hooks - INFO - 📄 Read file: /project/package.json
2026-01-12 21:27:06 - src.main - INFO - 🔧 Tool started: Read
2026-01-12 21:27:06 - src.main - INFO - ✅ Tool ended: Read - Duration: 45ms
2026-01-12 21:27:10 - src.main - INFO - ✅ Agent completed - Success: True, Duration: 5234ms, Events: 15
```

### Log Locations

- **`src/main.py`**: HTTP requests, SSE events, errors
- **`src/agent/runner.py`**: Agent lifecycle, SDK interactions, session management
- **`src/agent/hooks.py`**: Tool execution, file operations

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

**Option 1: Simple curl (shows raw events)**

```bash
curl -N http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Add hello world", "workdir": "/project"}'
```

The `-N` flag disables output buffering, showing events in real-time.

**Option 2: Using xh (HTTPie alternative)**

```bash
xh post http://localhost:8000/generate \
  prompt="Add hello world" \
  workdir=/project \
  --stream
```

**Option 3: Formatted event viewer (with jq)**

```bash
curl -N http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Add hello world", "workdir": "/project"}' | \
  while IFS= read -r line; do
    if [[ "$line" == data:* ]]; then
      echo "$line" | sed 's/^data: //' | jq -C '{type: .type, timestamp: (.timestamp | strftime("%H:%M:%S")), data: .data}' 2>/dev/null
    fi
  done
```

**Option 4: With xh and formatted output**

```bash
xh post http://localhost:8000/generate \
  prompt="Create a test file" \
  workdir=/tmp/coding-agent-test/test-app \
  --stream | grep --line-buffered "^data:" | \
  while IFS= read -r line; do
    echo "$line" | sed 's/^data: //' | jq -C '{type: .type, timestamp: (.timestamp | strftime("%H:%M:%S")), data: .data}' 2>/dev/null
  done
```

> **Note:** Some web-based API clients (e.g., Hoppscotch, Postman) may buffer SSE responses and not show real-time streaming. Use CLI tools like curl or xh to verify real-time behavior.

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
