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

# Install uv (fast Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

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

# Icons
RUN npm install --quiet --no-audit --no-fund \
    lucide-react

# 3D & Animation
RUN npm install --quiet --no-audit --no-fund \
    three \
    @react-three/fiber \
    @react-three/drei \
    @react-three/postprocessing \
    motion

# Physics Engines
RUN npm install --quiet --no-audit --no-fund \
    @react-three/rapier \
    matter-js

# Type Definitions
RUN npm install --quiet --no-audit --no-fund \
    @types/three

# Forms & Data
RUN npm install --quiet --no-audit --no-fund \
    react-hook-form

# Utilities & Data Fetching
RUN npm install --quiet --no-audit --no-fund \
    recharts \
    react-is \
    date-fns \
    clsx \
    tailwind-merge \
    axios \
    zustand \
    swr

# Initialize shadcn with all components for rich UI
RUN npx shadcn@latest init -d -y
RUN npx shadcn@latest add --all -y

# Set up coding agent
WORKDIR /home/user/coding-agent

# Copy coding agent files
COPY sandbox/coding-agent/pyproject.toml sandbox/coding-agent/uv.lock ./

# Install Python dependencies using uv (only core coding agent dependencies)
RUN uv sync

COPY sandbox/coding-agent/src ./src

# Set final working directory for Next.js app
WORKDIR /home/user/app

# Expose port for Next.js dev server
EXPOSE 3000

# Expose port for Coding Agent API
EXPOSE 8000

# Start coding agent server when container starts
CMD ["uv", "run", "--directory", "/home/user/coding-agent", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]