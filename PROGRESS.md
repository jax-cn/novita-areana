# Coding Agent + Sandbox Integration Progress

## Overview
Integrating a coding agent with sandbox for stable, debuggable, multi-page website generation.

---

## Phase 1: Sandbox Template Setup

### Task 1.1: Build the sandbox template
```bash
cd sanbox
novita-sandbox-cli template build -p . -n nextjs-agent-dev -c "npm run dev"
```

**Expected output**: Template ID and successful build message

**Verify**: Template appears in your Novita dashboard

---

### Task 1.2: Test sandbox instance creation
```bash
# In Node.js REPL or test script
node -e "
const { Sandbox } = require('novita-sandbox');
(async () => {
  const sbx = await Sandbox.create('nextjs-agent-dev', { timeoutMs: 60000 });
  console.log('Sandbox ID:', sbx.sandboxId);
  console.log('URL:', 'https://' + sbx.getHost(3000));
  // Keep alive for 30s to test
  await new Promise(r => setTimeout(r, 30000));
})();
"
```

**Expected output**: Sandbox ID and accessible URL

**Verify**: URL loads the placeholder Next.js page

---

### Task 1.3: Test file write and lint inside sandbox
```bash
node -e "
const { Sandbox } = require('novita-sandbox');
(async () => {
  const sbx = await Sandbox.create('nextjs-agent-dev', { timeoutMs: 120000 });
  
  // Write a test file with an error
  await sbx.files.write('app/page.tsx', \`
export default function Home() {
  const unused = 'test'; // Should trigger lint warning
  return <div>Hello</div>;
}
\`);
  
  // Run lint
  const lintResult = await sbx.commands.run('npm run lint 2>&1 || true');
  console.log('Lint output:', lintResult.stdout);
  
  // Run typecheck
  const tscResult = await sbx.commands.run('npx tsc --noEmit 2>&1 || true');
  console.log('TypeScript output:', tscResult.stdout);
})();
"
```

**Expected output**: Lint warnings about unused variable

**Verify**: Error detection working correctly

---

## Phase 2: API Integration

### Task 2.1: Test the /api/agent endpoint locally
```bash
npm run dev
```

Then in another terminal:
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple counter app with increment and decrement buttons",
    "model": {
      "id": "deepseek/deepseek-v3.2",
      "name": "DeepSeek V3.2",
      "provider": "Novita",
      "providerId": "novita",
      "color": "bg-purple-500"
    }
  }'
```

**Expected output**: SSE stream with planning, writing, linting steps

**Verify**: Final "ready" event includes sandbox URL

---

### Task 2.2: Test error recovery flow
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a complex dashboard with charts using recharts",
    "model": {
      "id": "deepseek/deepseek-v3.2",
      "name": "DeepSeek V3.2",
      "provider": "Novita",
      "providerId": "novita",
      "color": "bg-purple-500"
    },
    "maxRetries": 2
  }'
```

**Expected output**: Stream shows fixing steps if errors occur

**Verify**: Auto-fix attempts work correctly

---

## Phase 3: Frontend Integration

### Task 3.1: Create agent playground page
Create a new page at `app/agent/page.tsx` that uses the `useAgent` hook.

**File to create**: `app/agent/page.tsx`

**Key features**:
- Input field for prompt
- Model selector dropdown
- Real-time step display
- Preview iframe when ready
- File list display
- Error/warning display

---

### Task 3.2: Update step indicator for agent workflow
Update `components/app/step-indicator.tsx` to support agent step types:
- planning
- writing
- linting
- fixing
- building
- starting
- ready
- error

---

### Task 3.3: Create file viewer component
Create `components/app/file-viewer.tsx` to display generated files:
- File tree navigation
- Syntax highlighted code
- Copy to clipboard

---

## Phase 4: Testing & Refinement

### Task 4.1: Test multi-page generation
Test prompts that require multiple pages:
- "Create a blog with home, posts list, and single post pages"
- "Build an e-commerce site with product grid, cart, and checkout"
- "Make a dashboard with sidebar navigation and multiple sections"

**Verify**: All pages generated and linked correctly

---

### Task 4.2: Test component reuse
Test prompts that should generate shared components:
- "Create a social media app with shared post card component"
- "Build a task manager with reusable task item component"

**Verify**: Components properly extracted and imported

---

### Task 4.3: Test error scenarios
- Invalid prompt (empty, too vague)
- Network timeout
- LLM rate limiting
- Sandbox creation failure

**Verify**: Graceful error handling and user feedback

---

## Phase 5: Production Readiness

### Task 5.1: Add loading states and animations
- Skeleton loaders during generation
- Progress bar for overall completion
- Smooth transitions between steps

---

### Task 5.2: Add caching for sandbox templates
- Cache common dependencies
- Pre-warm sandbox instances
- Reduce cold start time

---

### Task 5.3: Add usage tracking and limits
- Token counting per generation
- Cost estimation display
- Rate limiting per user

---

## Current Status

| Phase | Task | Status |
|-------|------|--------|
| 1.1 | Build sandbox template | ⏳ Pending |
| 1.2 | Test sandbox creation | ⏳ Pending |
| 1.3 | Test lint inside sandbox | ⏳ Pending |
| 2.1 | Test /api/agent endpoint | ⏳ Pending |
| 2.2 | Test error recovery | ⏳ Pending |
| 3.1 | Create agent playground | ⏳ Pending |
| 3.2 | Update step indicator | ⏳ Pending |
| 3.3 | Create file viewer | ⏳ Pending |
| 4.1 | Test multi-page | ⏳ Pending |
| 4.2 | Test component reuse | ⏳ Pending |
| 4.3 | Test error scenarios | ⏳ Pending |
| 5.1 | Loading states | ⏳ Pending |
| 5.2 | Caching | ⏳ Pending |
| 5.3 | Usage tracking | ⏳ Pending |

---

## Files Created

| File | Purpose |
|------|---------|
| `sanbox/novita.Dockerfile` | Enhanced sandbox template with App Router, ESLint, TypeScript |
| `sanbox/novita.toml` | Template configuration |
| `lib/agent-workflow.ts` | Type definitions and utilities |
| `app/api/agent/route.ts` | SSE streaming API for agent workflow |
| `hooks/use-agent.ts` | React hook for frontend integration |

---

## Environment Variables Required

```bash
# .env.local
NOVITA_API_KEY=your-novita-api-key
E2B_API_KEY=your-e2b-api-key
```
