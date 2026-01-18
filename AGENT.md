# AGENT.md - Novita Arena

## Build/Test Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run aidev         # Vercel AI SDK devtools
```

**Note**: No test runner configured. Add test scripts to package.json if needed.

---

## Environment Variables

Required in `.env.local`:
```bash
NOVITA_API_KEY=your-novita-api-key
E2B_API_KEY=your-e2b-api-key
```

---

## Code Style Guidelines

### Import Order
1. React/hooks imports
2. Third-party packages
3. Internal imports with `@/` path alias
4. Type imports (if separate)

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LLMModel } from '@/lib/models'
```

### Component Patterns
- Client components: Add `'use client'` at top
- Components use `forwardRef` pattern for Radix UI primitives
- Use CVA (class-variance-authority) for variant styles
- Export types alongside components

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." }
  },
  defaultVariants: { variant: "default", size: "default" }
})

function Button({ className, variant, size, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

### Utility Functions
- Use `cn()` from `@/lib/utils` for Tailwind class merging
- Prefer functional patterns over class-based

### TypeScript
- Strict mode enabled
- Use `interface` for object shapes, `type` for unions/primitives
- Prefer explicit return types for exported functions

### Naming Conventions
- Components: PascalCase (`FragmentWeb.tsx`)
- Utilities: camelCase (`cn.ts`)
- Types/interfaces: PascalCase (`LLMModel`)
- Files: kebab-case for folders, PascalCase for components

### API Routes
- Use `export const maxDuration = 60` for Vercel timeouts
- Type request/response interfaces locally
- Try/catch with proper error responses:

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json()
    return Response.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
```

### Schema Validation
Use Zod for runtime validation:

```typescript
import { z } from 'zod'

export const fragmentSchema = z.object({
  title: z.string().describe('Short title'),
  code: z.string().describe('Generated code'),
})
export type FragmentSchema = z.infer<typeof fragmentSchema>
```

### Linting
Run `npm run lint` before committing. ESLint config uses `eslint-config-next` with TypeScript and core-web-vitals presets.

### Path Aliases
All internal imports use `@/` prefix:
```typescript
import { something } from '@/lib/something'
import { Button } from '@/components/ui/button'
```

---

## Key Dependencies

- **Next.js**: 16.1.1 (App Router)
- **React**: 19.2.3
- **Vercel AI SDK**: `ai`, `@ai-sdk/openai`, `@ai-sdk/react`
- **UI**: Radix UI primitives + shadcn/ui patterns
- **Styling**: Tailwind CSS v4 + `tailwind-merge`, `clsx`
- **Validation**: Zod
- **Sandbox**: `novita-sandbox`

---

## Architecture Notes

### API Structure
- `/api/chat` - LLM streaming with Vercel AI SDK `streamObject()`
- `/api/sandbox/create` - Sandbox creation via `novita-sandbox`

### State Management
- React hooks (`useState`, `useEffect`, custom hooks)
- `@/hooks/` for shared logic (e.g., `useSandboxAgent`, `useScreenRecorder`)

### Streaming Pattern
Server-side:
```typescript
import { streamObject } from 'ai'
const stream = await streamObject({ model, schema, messages })
return stream.toTextStreamResponse()
```

Client-side:
```typescript
import { experimental_useObject as useObject } from '@ai-sdk/react'
const { object, submit, isLoading } = useObject({ api: '/api/chat' })
```
