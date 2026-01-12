# Coding Agent 开发计划

**目标**: 构建一个基于 Claude Agent SDK 的 Coding Agent，用于修改 Next.js + shadcn/ui 项目。

**架构原则**:
- Coding Agent 作为独立的 HTTP Server，通过 SSE 流式推送事件
- 后端只负责启动 Sandbox，前端直接连接 Agent Server
- 本地测试和生产环境使用统一的接口方式

---

## 目录

- [架构概览](#架构概览)
- [Phase 1: Coding Agent HTTP Server (核心功能)](#phase-1-coding-agent-http-server-核心功能)
- [Phase 2: 本地测试集成](#phase-2-本地测试集成)
- [Phase 3: 专用工具实现](#phase-3-专用工具实现)
- [Phase 4: Novita Sandbox 集成 (生产环境)](#phase-4-novita-sandbox-集成-生产环境)
- [Phase 5: 前端集成与可视化](#phase-5-前端集成与可视化)
- [实施时间线](#实施时间线)

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                   用户浏览器 (Next.js Frontend)              │
│        输入 Prompt → 查看流式日志 → 实时预览                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Route (app/api/)                   │
│         /api/agent-local: 返回 localhost:8000              │
│         /api/agent: 创建 Novita Sandbox → 返回 sandbox URL  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          Coding Agent HTTP Server (FastAPI)                  │
│   本地: http://localhost:8000                               │
│   生产: https://sandbox-xxx.novita.ai                      │
│                                                              │
│   POST /generate - 接收 prompt，流式返回 SSE 事件             │
│   GET /health - 健康检查                                     │
│   GET /files - 列出项目文件                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  本地测试模式      │      │  生产模式          │
│  直接操作文件系统   │      │  操作 Sandbox FS  │
│  sandbox/test-app │      │  (预装 Next.js)  │
└──────────────────┘      └──────────────────┘
```

---

## Phase 1: Coding Agent HTTP Server (核心功能)

### 1.1 项目结构

```
sandbox/coding-agent/
├── pyproject.toml              # uv 项目配置
├── uv.lock                    # 依赖锁定文件
├── src/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── runner.py           # Claude Agent 运行器
│   │   ├── hooks.py            # Claude Agent Hooks
│   │   └── prompts/
│   │       └── system_prompt.txt
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── lint.py             # ESLint/TypeScript 检查
│   │   ├── build.py            # Next.js 构建
│   │   └── serve.py            # 启动开发服务器
│   └── models/
│       ├── __init__.py
│       └── events.py           # 事件模型定义
└── README.md
```

### 1.2 项目初始化

使用 `uv` 管理依赖：

```bash
cd sandbox/coding-agent
uv init --python 3.12
uv add claude-agent-sdk fastapi uvicorn httpx pydantic
uv add --dev pyright ruff
```

**pyproject.toml**:

```toml
[project]
name = "coding-agent"
version = "0.1.0"
description = "Claude Agent for Next.js + shadcn/ui development"
requires-python = ">=3.12"
dependencies = [
    "claude-agent-sdk>=0.1.0",
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "httpx>=0.25.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pyright>=1.1.0",
    "ruff>=0.1.0",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.uv]
dev-dependencies = ["pyright>=1.1.0", "ruff>=0.1.0"]
```

### 1.3 事件模型定义 (models/events.py)

定义所有 Agent 事件类型，用于 SSE 流式推送：

```python
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel


class EventType(str, Enum):
    """Agent 事件类型"""
    STARTED = "started"          # Agent 开始执行
    THINKING = "thinking"        # 正在思考
    TOOL_START = "tool_start"    # 开始使用工具
    TOOL_END = "tool_end"        # 工具执行完成
    TOOL_ERROR = "tool_error"    # 工具执行错误
    OUTPUT = "output"            # Claude 输出内容
    LINT_START = "lint_start"    # 开始 lint
    LINT_END = "lint_end"        # lint 完成
    BUILD_START = "build_start"  # 开始 build
    BUILD_END = "build_end"      # build 完成
    SERVE_START = "serve_start"  # 启动开发服务器
    SERVE_END = "serve_end"      # 服务器已启动
    ERROR = "error"              # 发生错误
    COMPLETED = "completed"      # 执行完成
    FILE_READ = "file_read"      # 读取文件
    FILE_WRITE = "file_write"    # 写入文件


class AgentEvent(BaseModel):
    """Agent 事件基类"""
    type: EventType
    timestamp: float
    data: dict[str, Any] = {}
```

### 1.4 Claude Agent Hooks (agent/hooks.py)

实现 Claude Agent SDK 的钩子，用于捕获工具调用：

```python
import time
from typing import Any
from claude_agent_sdk import HookContext
from ..models.events import AgentEvent, EventType


class AgentHooks:
    """Claude Agent 事件钩子，用于流式推送事件"""

    def __init__(self, event_queue):
        self.event_queue = event_queue
        self.tool_start_time: dict[str, float] = {}

    async def on_pre_tool_use(self, context: HookContext):
        """工具调用前"""
        tool_name = context.tool_name if hasattr(context, 'tool_name') else 'unknown'

        self.tool_start_time[tool_name] = time.time()

        event = AgentEvent(
            type=EventType.TOOL_START,
            timestamp=time.time(),
            data={
                "tool": tool_name,
                "args": context.tool_input if hasattr(context, 'tool_input') else {},
            }
        )
        await self.event_queue.put(event)

    async def on_post_tool_use(self, context: HookContext):
        """工具调用后"""
        tool_name = context.tool_name if hasattr(context, 'tool_name') else 'unknown'
        start_time = self.tool_start_time.get(tool_name, time.time())
        duration = time.time() - start_time

        # 判断是否是文件操作
        if tool_name in ['Read', 'Write']:
            file_path = context.tool_input.get('file_path') or context.tool_input.get('path')
            if tool_name == 'Read':
                event = AgentEvent(
                    type=EventType.FILE_READ,
                    timestamp=time.time(),
                    data={"path": file_path}
                )
            else:
                event = AgentEvent(
                    type=EventType.FILE_WRITE,
                    timestamp=time.time(),
                    data={"path": file_path, "size": len(context.tool_input.get('content', ''))}
                )
        else:
            event = AgentEvent(
                type=EventType.TOOL_END,
                timestamp=time.time(),
                data={
                    "tool": tool_name,
                    "duration_ms": duration * 1000,
                    "success": not context.error if hasattr(context, 'error') else True
                }
            )

        await self.event_queue.put(event)

    async def on_error(self, error: Exception):
        """发生错误"""
        event = AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={
                "message": str(error),
                "type": type(error).__name__
            }
        )
        await self.event_queue.put(event)

    async def on_content_block(self, content):
        """Claude 输出内容块"""
        if hasattr(content, 'text') and content.text:
            event = AgentEvent(
                type=EventType.OUTPUT,
                timestamp=time.time(),
                data={"content": content.text}
            )
            await self.event_queue.put(event)
```

### 1.5 Claude Agent Runner (agent/runner.py)

实现 Agent 运行逻辑：

```python
import os
import json
import asyncio
import time
from pathlib import Path
from typing import AsyncIterator
from claude_agent_sdk import ClaudeAgentOptions, ClaudeSDKClient
from .hooks import AgentHooks
from ..models.events import AgentEvent, EventType, StartedEvent, CompletedEvent


SESSIONS_FILE = Path("/data/sessions.json")


class AgentRunner:
    """Claude Agent 运行器"""

    def __init__(self, workdir: str, event_queue):
        self.workdir = workdir
        self.event_queue = event_queue
        self.session_file = SESSIONS_FILE

        # 配置 Novita API
        os.environ["ANTHROPIC_BASE_URL"] = os.environ.get("ANTHROPIC_BASE_URL", "https://api.novita.ai/anthropic")
        os.environ["ANTHROPIC_API_KEY"] = os.environ.get("ANTHROPIC_AUTH_TOKEN", "")
        os.environ["ANTHROPIC_MODEL"] = os.environ.get("ANTHROPIC_MODEL", "moonshotai/kimi-k2-instruct")

        # 加载 System Prompt
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """加载 System Prompt"""
        prompt_file = Path(__file__).parent / "prompts" / "system_prompt.txt"
        return prompt_file.read_text()

    def _load_session_id(self) -> str | None:
        """加载现有 Session ID"""
        if not self.session_file.exists():
            return None
        sessions = json.loads(self.session_file.read_text())
        return sessions.get("default")

    def _save_session_id(self, session_id: str):
        """保存 Session ID"""
        sessions = {}
        if self.session_file.exists():
            sessions = json.loads(self.session_file.read_text())
        sessions["default"] = session_id
        self.session_file.parent.mkdir(parents=True, exist_ok=True)
        self.session_file.write_text(json.dumps(sessions, indent=2))

    async def run(self, user_prompt: str) -> AsyncIterator[AgentEvent]:
        """运行 Agent 并流式返回事件"""
        start_time = time.time()

        # 发送开始事件
        event = StartedEvent(
            timestamp=start_time,
            data={
                "model": os.environ["ANTHROPIC_MODEL"],
                "prompt": user_prompt,
            }
        )
        yield event

        # 创建 Hooks
        hooks = AgentHooks(self.event_queue)

        # 加载 Session
        session_id = self._load_session_id()

        # 配置 Claude Agent
        options = ClaudeAgentOptions(
            resume=session_id,
            system_prompt=self.system_prompt,
            cwd=self.workdir,
            setting_sources=["project"],
            allowed_tools=["Read", "Write", "Bash"],
            permission_mode="acceptEdits",
            max_turns=20,
        )

        async with ClaudeSDKClient(options=options) as client:
            # 发送用户 prompt
            await client.query(user_prompt)

            # 接收响应
            async for msg in client.receive_response():
                # 保存 session ID
                if hasattr(msg, 'session_id'):
                    self._save_session_id(msg.session_id)

                # 处理内容块
                if hasattr(msg, 'content'):
                    for block in msg.content:
                        if hasattr(block, 'text'):
                            event = AgentEvent(
                                type=EventType.OUTPUT,
                                timestamp=time.time(),
                                data={"content": block.text}
                            )
                            yield event

        # 发送完成事件
        duration = time.time() - start_time
        event = CompletedEvent(
            timestamp=time.time(),
            data={
                "success": True,
                "total_duration_ms": duration * 1000,
            }
        )
        yield event
```

### 1.6 FastAPI 主应用 (main.py)

实现 HTTP Server，提供 SSE 接口：

```python
import asyncio
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.agent.runner import AgentRunner
from src.models.events import AgentEvent


class GenerateRequest(BaseModel):
    prompt: str
    workdir: str = "/project"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    print("🚀 Coding Agent Server starting...")
    yield
    print("👋 Coding Agent Server shutting down...")


app = FastAPI(
    title="Coding Agent",
    description="Claude Agent for Next.js + shadcn/ui development",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "Coding Agent",
        "version": "0.1.0",
        "endpoints": {
            "POST /generate": "Generate code with Claude Agent",
            "GET /health": "Health check",
        }
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "ok", "model": os.environ.get("ANTHROPIC_MODEL")}


async def event_generator(runner: AgentRunner, prompt: str) -> AsyncIterator[str]:
    """事件生成器，用于 SSE"""
    try:
        async for event in runner.run(prompt):
            # 转换为 SSE 格式
            data = f"data: {event.model_dump_json()}\n\n"
            yield data
    except Exception as e:
        error_event = AgentEvent(
            type="error",
            timestamp=time.time(),
            data={"message": str(e)}
        )
        yield f"data: {error_event.model_dump_json()}\n\n"


@app.post("/generate")
async def generate(req: GenerateRequest):
    """生成代码接口"""
    # 验证工作目录
    if not os.path.exists(req.workdir):
        raise HTTPException(status_code=400, detail=f"Workdir does not exist: {req.workdir}")

    # 创建事件队列
    event_queue = asyncio.Queue()

    # 创建 Runner
    runner = AgentRunner(workdir=req.workdir, event_queue=event_queue)

    # 返回 SSE 流
    return StreamingResponse(
        event_generator(runner, req.prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Nginx 禁用缓冲
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
```

### 1.7 System Prompt (agent/prompts/system_prompt.txt)

```txt
You are an expert Next.js developer specializing in React Server Components,
TypeScript, and shadcn/ui component library.

## Core Responsibilities
1. Read and understand existing codebase structure
2. Create new pages, components, and features
3. Fix bugs and improve existing code
4. Follow Next.js App Router conventions
5. Use shadcn/ui components when available
6. Ensure code quality with lint and build checks

## Workflow
1. ALWAYS use Read tool before making changes to understand context
2. Use Write tool to create or modify files
3. Use Bash tool to run lint, build, and dev server commands

## Next.js Guidelines
- Use app/ directory structure (App Router)
- Create routes as app/[route]/page.tsx
- Use Server Components by default
- Add "use client" only when necessary (interactivity)
- Follow TypeScript strict mode conventions
- Maintain type safety

## shadcn/ui Guidelines
- Check components.json for existing components
- Use existing components from components/ui/ directory
- Install new components: npx shadcn-ui@latest add [name]
- Use cn() utility for className merging (from lib/utils.ts)
- Follow component patterns and styling

## File Operations
- Read tools: Understand file paths relative to project root
- Write tools: Create/modify files with full content
- Bash tools: Run npm commands, git operations

## Quality Checks
After making significant changes:
1. Run lint: npm run lint
2. Run type check: npx tsc --noEmit
3. Run build: npm run build

## Error Handling
- Parse error messages carefully
- Fix root causes, not symptoms
- Retry failed operations up to 3 times
- Report clear error messages

## Communication
- Keep user informed of your actions
- Explain what you're doing and why
- Ask for clarification when requirements are unclear
```

### 1.8 开发命令

```bash
# 初始化项目
cd sandbox/coding-agent
uv init --python 3.12

# 添加依赖
uv add claude-agent-sdk fastapi uvicorn httpx pydantic
uv add --dev pyright ruff

# 运行开发服务器
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# 类型检查
uv run pyright

# 代码格式化
uv run ruff check .
uv run ruff format .
```

---

## Phase 2: 本地测试集成

### 2.1 Next.js API Route (本地模式)

**app/api/agent-local/route.ts**:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const LOCAL_AGENT_URL = 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const { prompt, workdir = 'sandbox/test-app' } = await req.json()

  // 直接返回本地 Agent Server URL
  // 前端直接连接 localhost:8000
  return NextResponse.json({
    agentUrl: LOCAL_AGENT_URL,
    workdir: workdir,
    mode: 'local'
  })
}

export async function GET() {
  // 健康检查
  const response = await fetch(`${LOCAL_AGENT_URL}/health`)
  const health = await response.json()
  return NextResponse.json({
    status: 'ok',
    localAgent: health
  })
}
```

### 2.2 前端调用示例

```javascript
// 1. 获取 Agent URL
const { agentUrl } = await fetch('/api/agent-local', {
  method: 'POST',
  body: JSON.stringify({ prompt: userPrompt })
}).then(r => r.json())

// 2. 直接连接 Agent Server
const response = await fetch(`${agentUrl}/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: userPrompt,
    workdir: '/absolute/path/to/sandbox/test-app'
  })
})

// 3. 读取 SSE 流
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  const lines = chunk.split('\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6))
      handleAgentEvent(event)
    }
  }
}
```

---

## Phase 3: 专用工具实现

### 3.1 Lint 工具 (tools/lint.py)

实现 ESLint 和 TypeScript 检查：

```python
import subprocess
import json
from pathlib import Path
from typing import Dict, List


def run_eslint(workdir: str) -> Dict:
    """运行 ESLint"""
    result = subprocess.run(
        ["npm", "run", "lint", "--", "--format", "json"],
        cwd=workdir,
        capture_output=True,
        text=True
    )

    if result.stdout:
        try:
            lint_output = json.loads(result.stdout)
            return {
                "success": result.returncode == 0,
                "issues": lint_output
            }
        except json.JSONDecodeError:
            pass

    return {"success": True, "issues": []}


def run_tsc(workdir: str) -> Dict:
    """运行 TypeScript 类型检查"""
    result = subprocess.run(
        ["npx", "tsc", "--noEmit"],
        cwd=workdir,
        capture_output=True,
        text=True
    )

    issues = []
    if result.stdout and "error TS" in result.stdout:
        for line in result.stdout.split('\n'):
            if "error TS" in line:
                # 解析错误
                parts = line.split(':')
                if len(parts) >= 4:
                    issues.append({
                        "file": parts[0],
                        "line": int(parts[1]),
                        "severity": "error",
                        "message": parts[-1].strip()
                    })

    return {
        "success": len(issues) == 0,
        "issues": issues
    }


async def lint_project(workdir: str):
    """运行完整 lint 检查"""
    eslint_result = run_eslint(workdir)
    tsc_result = run_tsc(workdir)

    all_issues = eslint_result.get("issues", []) + tsc_result.get("issues", [])

    return {
        "success": eslint_result["success"] and tsc_result["success"],
        "errors": len([i for i in all_issues if i.get("severity") == "error"]),
        "warnings": len([i for i in all_issues if i.get("severity") == "warning"]),
        "details": all_issues
    }
```

### 3.2 Build 工具 (tools/build.py)

```python
import subprocess


async def build_project(workdir: str, timeout: int = 120):
    """运行 Next.js 构建"""
    try:
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=workdir,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": f"Build timed out after {timeout} seconds"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

### 3.3 Serve 工具 (tools/serve.py)

```python
import subprocess
import signal
from typing import Optional


class DevServer:
    """开发服务器管理器"""

    def __init__(self, workdir: str, port: int = 3000):
        self.workdir = workdir
        self.port = port
        self.process: Optional[subprocess.Popen] = None

    async def start(self):
        """启动开发服务器"""
        self.process = subprocess.Popen(
            ["npm", "run", "dev", "--", "--port", str(self.port)],
            cwd=self.workdir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=lambda: signal.signal(signal.SIGINT, signal.SIG_IGN)
        )

        return {
            "success": True,
            "url": f"http://localhost:{self.port}",
            "port": self.port
        }

    def stop(self):
        """停止开发服务器"""
        if self.process:
            self.process.terminate()
            self.process.wait(timeout=5)
```

---

## Phase 4: Novita Sandbox 集成 (生产环境)

### 4.1 Sandbox Template 配置

**novita.toml**:

```toml
[project]
name = "nextjs-coding-agent"
runtime = "python3.12"

[build]
base_image = "node:20-bullseye"
apt_packages = ["git"]
pip_packages = ["claude-agent-sdk", "fastapi", "uvicorn", "httpx", "pydantic"]
npm_packages = []
commands = [
    "pip install uv",
    "uv add claude-agent-sdk fastapi uvicorn httpx pydantic",
    "mkdir -p /project",
]
environment = [
    "ANTHROPIC_BASE_URL=https://api.novita.ai/anthropic",
    "ANTHROPIC_MODEL=moonshotai/kimi-k2-instruct",
]
expose_ports = [8000]

[template]
description = "Next.js Coding Agent with Claude Agent SDK"
```

### 4.2 生产环境 API Route

**app/api/agent/route.ts**:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Sandbox } from 'novita-sandbox'

export const maxDuration = 300

export async function POST(req: Request) {
  const { prompt, template = 'nextjs-coding-agent' } = await req.json()

  // 创建 Sandbox
  const sbx = await Sandbox.create(template, {
    metadata: { prompt },
    timeoutMs: 10 * 60 * 1000,
  })

  // 等待 agent server 启动
  await new Promise(resolve => setTimeout(resolve, 3000))

  // 返回 Sandbox Agent Server URL
  const agentUrl = `https://${sbx.getHost(8000)}`

  return NextResponse.json({
    agentUrl,
    sandboxId: sbx.sandboxId,
    mode: 'sandbox'
  })
}
```

---

## Phase 5: 前端集成与可视化

### 5.1 实时日志组件

**components/AgentEventLog.tsx**:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { AgentEvent } from '@/lib/agent-events'

export function AgentEventLog({ agentUrl, prompt }: { agentUrl: string, prompt: string }) {
  const [events, setEvents] = useState<AgentEvent[]>([])

  useEffect(() => {
    const connect = async () => {
      const response = await fetch(`${agentUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, workdir: '/project' })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const event = JSON.parse(line.slice(6))
            setEvents(prev => [...prev, event])
          }
        }
      }
    }

    connect()
  }, [agentUrl, prompt])

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <EventItem key={i} event={event} />
      ))}
    </div>
  )
}

function EventItem({ event }: { event: AgentEvent }) {
  const icon = getEventIcon(event.type)
  const color = getEventColor(event.type)

  return (
    <div className={`flex items-start gap-2 p-2 rounded ${color}`}>
      {icon}
      <div className="flex-1">
        <div className="font-medium capitalize">{event.type}</div>
        {event.data && (
          <pre className="text-sm mt-1 bg-black/10 p-2 rounded overflow-auto">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
```

---

## 实施时间线

### 第 1 周：Phase 1 (核心 HTTP Server)

**任务清单**:

- [ ] 创建项目结构 (`sandbox/coding-agent/`)
- [ ] 使用 `uv` 初始化 Python 项目
- [ ] 配置 `pyproject.toml` 依赖
- [ ] 实现事件模型 (`models/events.py`)
- [ ] 实现 Agent Hooks (`agent/hooks.py`)
- [ ] 实现 Agent Runner (`agent/runner.py`)
- [ ] 实现 FastAPI 应用 (`main.py`)
- [ ] 编写 System Prompt (`agent/prompts/system_prompt.txt`)
- [ ] 本地测试：运行 agent server，调用 `/generate` 接口
- [ ] 验证 SSE 流式输出

**验收标准**:

- [ ] Agent Server 可以成功启动在 `http://localhost:8000`
- [ ] `/health` 接口返回正常
- [ ] `/generate` 接口可以接收 prompt 并返回 SSE 流
- [ ] 事件类型完整（STARTED, TOOL_START, FILE_READ, FILE_WRITE, COMPLETED 等）

### 第 2 周：Phase 2 (本地测试)

**任务清单**:

- [ ] 创建 Next.js API Route (`app/api/agent-local/route.ts`)
- [ ] 实现前端事件日志组件 (`components/AgentEventLog.tsx`)
- [ ] 测试完整流程：前端 → API → Agent Server
- [ ] 修改 `sandbox/test-app`，验证功能
- [ ] 确保工作目录正确映射

**验收标准**:

- [ ] 前端可以成功连接本地 Agent Server
- [ ] 实时显示 Agent 工具调用日志
- [ ] 文件读写操作正确记录
- [ ] Agent 能够成功修改 `sandbox/test-app` 代码

### 第 3 周：Phase 3 (专用工具)

**任务清单**:

- [ ] 实现 lint 工具（ESLint + TypeScript）
- [ ] 实现 build 工具
- [ ] 实现 serve 工具
- [ ] 集成工具到 Agent Hooks
- [ ] 测试调试流程（lint → 修复 → build → serve）
- [ ] 实现自动错误重试逻辑

**验收标准**:

- [ ] Lint 工具能够检测并报告 ESLint 和 TypeScript 错误
- [ ] Build 工具能够执行 Next.js 构建
- [ ] Serve 工具能够启动开发服务器
- [ ] Agent 能够自动修复 lint 错误
- [ ] 完整流程：代码生成 → lint → 修复 → build → serve 成功

### 第 4 周：Phase 4-5 (生产环境)

**任务清单**:

- [ ] 创建 Novita Sandbox Template (`novita.toml`)
- [ ] 配置 sandbox 镜像（Node.js + Python 3.12）
- [ ] 实现生产 API Route (`app/api/agent/route.ts`)
- [ ] 测试 Sandbox 集成
- [ ] 优化前端可视化组件（图标、颜色、动画）
- [ ] 添加代码预览和对比功能
- [ ] 添加预览窗口（iframe）

**验收标准**:

- [ ] Sandbox Template 可以成功创建
- [ ] 生产 API 能够返回 Sandbox Agent Server URL
- [ ] 前端可以连接 Sandbox Agent Server
- [ ] 日志组件在 Sandbox 模式下正常工作
- [ ] 预览窗口可以显示运行的 Next.js 应用
- [ ] 用户体验流畅，无明显卡顿或错误

---

## 开发命令参考

### Python Agent Server

```bash
# 进入项目目录
cd sandbox/coding-agent

# 初始化项目
uv init --python 3.12

# 添加依赖
uv add claude-agent-sdk fastapi uvicorn httpx pydantic
uv add --dev pyright ruff

# 运行开发服务器
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# 类型检查
uv run pyright src/

# 代码检查
uv run ruff check src/

# 代码格式化
uv run ruff format src/
```

### Next.js 集成

```bash
# 启动 Next.js 开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行 linter
npm run lint
```

### 测试 API

```bash
# 测试 Agent Health
curl http://localhost:8000/health

# 测试生成接口
curl -N http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Add a hello world page", "workdir": "/path/to/test-app"}'
```

---

## 环境变量

### Agent Server 需要的环境变量

```bash
# Novita Anthropic API 配置
export ANTHROPIC_BASE_URL="https://api.novita.ai/anthropic"
export ANTHROPIC_AUTH_TOKEN="<Novita API Key>"
export ANTHROPIC_MODEL="moonshotai/kimi-k2-instruct"
export ANTHROPIC_SMALL_FAST_MODEL="moonshotai/kimi-k2-instruct"
```

### 创建 .env 文件

```bash
# sandbox/coding-agent/.env
ANTHROPIC_BASE_URL=https://api.novita.ai/anthropic
ANTHROPIC_AUTH_TOKEN=your-novita-api-key-here
ANTHROPIC_MODEL=moonshotai/kimi-k2-instruct
```

---

## 注意事项

1. **依赖管理**: 统一使用 `uv` 管理 Python 依赖
2. **API 兼容性**: Novita API 与 Anthropic API 完全兼容，只需设置环境变量
3. **流式输出**: 使用 SSE (Server-Sent Events) 实现实时日志推送
4. **错误处理**: Agent 需要能够处理并修复 lint/build 错误
5. **Session 管理**: 保存 Claude Agent Session 以支持多轮对话
6. **工作目录**: 本地测试和生产环境使用不同的工作目录映射

---

## 相关文档

- [Claude Agent SDK 文档](https://github.com/anthropics/anthropic-sdk-python)
- [Novita Sandbox 文档](https://docs.novita.ai/sandbox)
- [Novita API 文档](https://docs.novita.ai/anthropic)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [uv 文档](https://docs.astral.sh/uv/)

---

**版本**: 1.0
**最后更新**: 2025-01-12
