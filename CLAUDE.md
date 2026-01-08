# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.1 application using the modern App Router architecture with React 19, TypeScript, and Tailwind CSS 4.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Framework & Stack
- **Next.js 16.1.1** with App Router (no `pages/` directory)
- **React 19.2.3** with React Server Components
- **TypeScript 5.x** with strict mode enabled
- **Tailwind CSS 4.x** with PostCSS plugin
- **ESLint 9** with flat config format

### Directory Structure
```
app/               # Next.js App Router (layout.tsx, page.tsx, routes)
  ├── playground/  # Creation playground page
  └── recording/   # Recording/battle mode page
components/        # React components
  ├── ui/         # shadcn/ui components
  └── app/        # Application-specific components
lib/              # Utility functions (cn, etc.)
types/            # TypeScript type definitions
public/           # Static assets (SVG icons, images)
```

### Key Configuration Files
- `next.config.ts` - Next.js config with custom dev origins: `["192.168.31.100"]`
- `tsconfig.json` - TypeScript with path alias `"@/*": ["./*"]`
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `eslint.config.mjs` - ESLint flat config combining `core-web-vitals` and `typescript` presets

### Styling System
- **Color Space**: OKLCH for better perceptual uniformity
- **Theming**: CSS custom properties in `app/globals.css` for dual theme support (light/dark)
- **Dark Mode**: Uses `.dark` class selector
- **Typography**: Geist font family (Sans & Mono) via `next/font`

### Component Conventions
- Functional components with TypeScript
- Readonly props pattern: `interface Props { readonly children: ReactNode }`
- Server Components by default (no `"use client"` unless needed)

### Code Quality Rules
**IMPORTANT**: Run `npm run lint` after each feature or bugfix to ensure code quality and catch issues early. All code must pass linting before being considered complete.

### Path Aliases
Use `@/` prefix for imports from the project root (configured in `tsconfig.json`):
```typescript
import Component from "@/app/page";
```

## Pages

### Home Page (`/`)
- **Community Gallery** - Landing page with hero section, search bar, category filters, and app gallery grid
- Displays AI-generated apps from the community with fork and like functionality

### Playground Page (`/playground`)
- **Creation Playground** - Split-view interface for app generation
- Left panel: Live preview of the generated app
- Right panel: Step-by-step execution progress
- Bottom: Input bar for describing the app to build

### Recording Page (`/recording`)
- **Battle Mode** - Side-by-side comparison of two AI models generating apps
- Recording controls with pause, cancel, and done options
- Real-time stats for each model (tokens, time, score)

## Application Components

Located in `components/app/`:

- **AppCard** - Gallery card component for displaying AI-generated apps
- **ModelBadge** - Badge component for displaying model names with color coding
- **ModelInfoCard** - Stats card showing token count and execution time
- **RecordingIndicator** - Recording status display with duration timer
- **StepIndicator** - Progress steps visualization for the playground
- **ShareModal** - Export and share dialog with social sharing options

## Types

TypeScript types are defined in `types/index.ts`:
- **ModelName** - Union type for supported AI models
- **AppCard** - Interface for app gallery data
- **ModelConfig** - Configuration for model display
- **StepConfig** - Configuration for execution steps
