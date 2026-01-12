# Novita Sandbox Template with Coding Agent Support
# Base: Node.js 24 slim with essential build tools
FROM node:24-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory for the Next.js project
WORKDIR /home/user/app

# Create Next.js 14 app with TypeScript, Tailwind, App Router
RUN npx create-next-app@14.2.33 . \
    --ts \
    --tailwind \
    --eslint \
    --app \
    --import-alias "@/*" \
    --use-npm \
    --no-src-dir

# Initialize shadcn with all components for rich UI
RUN npx shadcn@latest init -d -y
RUN npx shadcn@latest add --all -y

# Set final working directory
WORKDIR /home/user/app

# Expose port for Next.js dev server
EXPOSE 3000

# Expose port for OpenCode server
EXPOSE 4096