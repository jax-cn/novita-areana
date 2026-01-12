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
# Using --no-eslint initially, we'll add stricter config after
RUN npx create-next-app@14.2.33 . \
    --ts \
    --tailwind \
    --eslint \
    --app \
    --import-alias "@/*" \
    --use-npm \
    --no-src-dir

# Initialize shadcn with all components for rich UI
RUN npx shadcn@2.1.7 init -d
RUN npx shadcn@2.1.7 add --all

# Add strict ESLint configuration for better error detection
RUN npm install -D \
    @typescript-eslint/parser@^7 \
    @typescript-eslint/eslint-plugin@^7 \
    eslint-plugin-react-hooks@^4 \
    eslint-plugin-jsx-a11y@^6

# Copy configuration files from template-files directory
COPY template-files/.eslintrc.json /home/user/app/.eslintrc.json
COPY template-files/tsconfig.json /home/user/app/tsconfig.json
COPY template-files/agent-runner.js /home/user/app/agent-runner.js

# Make agent runner executable
RUN chmod +x /home/user/app/agent-runner.js

# Create a clean starting point for the app directory
# Remove default app content so agent can generate fresh
RUN rm -rf /home/user/app/app/* 

# Create minimal app structure that agent will populate
RUN mkdir -p /home/user/app/app \
    && mkdir -p /home/user/app/components \
    && mkdir -p /home/user/app/lib

# Copy app template files
COPY template-files/app/layout.tsx /home/user/app/app/layout.tsx
COPY template-files/app/globals.css /home/user/app/app/globals.css
COPY template-files/app/page.tsx /home/user/app/app/page.tsx

# Set final working directory
WORKDIR /home/user/app

# Expose port for Next.js dev server
EXPOSE 3000

# Default command starts the dev server with turbo for fast refresh
CMD ["npm", "run", "dev"]
