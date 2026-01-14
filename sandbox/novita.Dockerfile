# Novita Sandbox Template with Coding Agent Support
# Base: Node.js 24 slim with essential build tools
FROM node:24-slim

# Install system dependencies (Python for coding agent)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install uv (fast Python package manager) globally
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
RUN mv /root/.local/bin/uv /usr/local/bin/uv

# Create non-root user for running the coding agent
# Claude CLI cannot run as root with --dangerously-skip-permissions
RUN useradd -m -s /bin/bash user && \
    mkdir -p /home/user/.local/bin && \
    chown -R user:user /home/user

# Set working directory for the Next.js project
WORKDIR /home/user/app

# Create Next.js 15 app with React 19, TypeScript, Tailwind, App Router
RUN printf "n\n" | npx create-next-app@latest . \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --import-alias "@/*" \
    --use-npm \
    --no-src-dir \
    --turbopack

# Install essential npm packages (simplified list)

# Core utilities (used by many packages)
RUN npm install --quiet --no-audit --no-fund \
    clsx \
    tailwind-merge \
    react-is

# UI components
RUN npm install --quiet --no-audit --no-fund \
    lucide-react \
    react-resizable-panels

# Forms & validation
RUN npm install --quiet --no-audit --no-fund \
    react-hook-form

# Data fetching & state
RUN npm install --quiet --no-audit --no-fund \
    axios \
    zustand \
    swr

# Data visualization
RUN npm install --quiet --no-audit --no-fund \
    recharts \
    date-fns

# 3D & Animation
RUN npm install --quiet --no-audit --no-fund \
    three \
    @react-three/fiber \
    @react-three/drei \
    @react-three/postprocessing \
    motion

# Physics engines
RUN npm install --quiet --no-audit --no-fund \
    @react-three/rapier \
    matter-js

# Type definitions
RUN npm install --quiet --no-audit --no-fund \
    @types/three \
    @types/react-resizable-panels

# Initialize shadcn with all components for rich UI
RUN npx shadcn@latest init -d -y
RUN npx shadcn@latest add --all -y

# Set up coding agent
WORKDIR /home/user/coding-agent

# Copy coding agent files
COPY sandbox/coding-agent/pyproject.toml sandbox/coding-agent/uv.lock ./

# Install Claude CLI globally (required by claude-agent-sdk)
RUN npm install -g @anthropic-ai/claude-code

COPY sandbox/coding-agent/src ./src

# Set ownership of all files to the non-root user
RUN chown -R user:user /home/user

# Switch to non-root user
USER user

# Install Python dependencies using uv (must run as non-root user)
RUN uv sync

# Set final working directory for Next.js app
WORKDIR /home/user/app

# Expose port for Next.js dev server
EXPOSE 3000

# Expose port for Coding Agent API
EXPOSE 8000

# Start coding agent server when container starts
CMD ["uv", "run", "--directory", "/home/user/coding-agent", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]