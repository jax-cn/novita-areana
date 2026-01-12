import { getModelClientWithDevTools, LLMModel, LLMModelConfig } from '@/lib/devtools-model'
import { 
  AgentStep, 
  AgentFile, 
  AgentIssue, 
  AgentPlan,
  createStep,
  formatIssuesForPrompt 
} from '@/lib/agent-workflow'
import { Sandbox } from 'novita-sandbox'
import { streamText } from 'ai'
import { z } from 'zod'

export const maxDuration = 300

const sandboxTimeout = 10 * 60 * 1000

const planSchema = z.object({
  title: z.string(),
  description: z.string(),
  pages: z.array(z.object({
    path: z.string(),
    purpose: z.string(),
    components: z.array(z.string())
  })),
  components: z.array(z.object({
    name: z.string(),
    purpose: z.string()
  })),
  dependencies: z.array(z.string())
})

const filesSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string()
  }))
})

function createPlanningPrompt(userPrompt: string): string {
  return `You are an expert Next.js developer. Analyze the following request and create a detailed implementation plan.

USER REQUEST:
${userPrompt}

Create a JSON plan with:
1. title: Short app title (2-4 words)
2. description: One sentence description
3. pages: Array of pages to create, each with:
   - path: Route path (e.g., "/", "/dashboard", "/settings")
   - purpose: What this page does
   - components: Array of component names used on this page
4. components: Array of reusable components needed, each with:
   - name: Component name (PascalCase)
   - purpose: What this component does
5. dependencies: Additional npm packages needed (beyond Next.js, React, Tailwind, shadcn)

IMPORTANT: 
- Use Next.js App Router conventions (app/ directory)
- Leverage shadcn/ui components when possible
- Keep it minimal but complete

Respond with ONLY valid JSON, no markdown code blocks.`
}

function createCodeGenPrompt(plan: AgentPlan, pageIndex: number): string {
  const page = plan.pages[pageIndex]
  const relevantComponents = plan.components.filter(c => 
    page.components.includes(c.name)
  )

  return `You are an expert Next.js developer. Generate code for the following page.

APP: ${plan.title}
${plan.description}

PAGE TO GENERATE:
- Path: ${page.path}
- Purpose: ${page.purpose}
- Components used: ${page.components.join(', ')}

RELEVANT COMPONENTS:
${relevantComponents.map(c => `- ${c.name}: ${c.purpose}`).join('\n')}

REQUIREMENTS:
1. Use Next.js 14 App Router (app/ directory)
2. Use TypeScript with strict types
3. Use Tailwind CSS for styling
4. Import from shadcn/ui: @/components/ui/*
5. Create clean, production-ready code

Generate a JSON response with:
{
  "files": [
    { "path": "app/page.tsx", "content": "..." },
    { "path": "components/MyComponent.tsx", "content": "..." }
  ]
}

File paths should be relative to project root.
Respond with ONLY valid JSON, no markdown.`
}

function createFixPrompt(files: AgentFile[], issues: AgentIssue[]): string {
  const issuesText = formatIssuesForPrompt(issues)
  const filesText = files.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n')

  return `You are an expert Next.js developer. Fix the following code issues.

CURRENT FILES:
${filesText}

ISSUES TO FIX:
${issuesText}

REQUIREMENTS:
1. Fix ALL errors and warnings
2. Maintain the same functionality
3. Keep the code clean and well-typed
4. Do not introduce new issues

Generate a JSON response with the fixed files:
{
  "files": [
    { "path": "app/page.tsx", "content": "...fixed code..." }
  ]
}

Only include files that need changes.
Respond with ONLY valid JSON, no markdown.`
}

async function generateWithLLM<T>(
  model: LLMModel,
  prompt: string,
  schema: z.ZodType<T>
): Promise<T> {
  const config: LLMModelConfig = { model: model.id }
  const modelClient = getModelClientWithDevTools(model, config)

  const result = await streamText({
    model: modelClient,
    messages: [{ role: 'user', content: prompt }],
    maxOutputTokens: 16000,
  })

  let fullText = ''
  for await (const chunk of result.textStream) {
    fullText += chunk
  }

  const jsonMatch = fullText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return schema.parse(parsed)
}

async function runLint(sbx: Sandbox): Promise<{ success: boolean; issues: AgentIssue[] }> {
  try {
    const result = await sbx.commands.run('npm run lint -- --format json 2>/dev/null || true')
    
    if (result.stdout) {
      try {
        const lintOutput = JSON.parse(result.stdout)
        const issues: AgentIssue[] = lintOutput.flatMap((f: { filePath: string; messages: Array<{ line: number; column: number; severity: number; message: string; ruleId: string }> }) =>
          f.messages.map((m: { line: number; column: number; severity: number; message: string; ruleId: string }) => ({
            file: f.filePath.replace('/home/user/app/', ''),
            line: m.line,
            column: m.column,
            severity: m.severity === 2 ? 'error' as const : 'warning' as const,
            message: m.message,
            ruleId: m.ruleId
          }))
        )
        const errors = issues.filter(i => i.severity === 'error')
        return { success: errors.length === 0, issues }
      } catch {
        return { success: true, issues: [] }
      }
    }
    return { success: true, issues: [] }
  } catch {
    return { success: true, issues: [] }
  }
}

async function runTypeCheck(sbx: Sandbox): Promise<{ success: boolean; issues: AgentIssue[] }> {
  try {
    const result = await sbx.commands.run('npx tsc --noEmit 2>&1 || true')
    
    if (result.stdout && result.stdout.includes('error TS')) {
      const issues: AgentIssue[] = result.stdout.split('\n')
        .filter((line: string) => line.includes('error TS'))
        .map((line: string) => {
          const match = line.match(/(.+)\((\d+),(\d+)\): error (TS\d+): (.+)/)
          if (match) {
            return {
              file: match[1].replace('/home/user/app/', ''),
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              severity: 'error' as const,
              message: match[5],
              ruleId: match[4]
            }
          }
          return { message: line, severity: 'error' as const }
        })
      return { success: false, issues }
    }
    return { success: true, issues: [] }
  } catch {
    return { success: true, issues: [] }
  }
}

async function runBuild(sbx: Sandbox): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sbx.commands.run('npm run build 2>&1', { timeoutMs: 120000 })
    
    if (result.exitCode !== 0) {
      return { success: false, error: result.stdout || result.stderr }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

function sendStep(encoder: TextEncoder, controller: ReadableStreamDefaultController, step: AgentStep) {
  const data = `data: ${JSON.stringify(step)}\n\n`
  controller.enqueue(encoder.encode(data))
}

export async function POST(req: Request) {
  const { prompt, model, skipBuild = true, maxRetries = 2 } = await req.json() as {
    prompt: string
    model: LLMModel
    skipBuild?: boolean
    maxRetries?: number
  }

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      let sbx: Sandbox | null = null
      const allFiles: AgentFile[] = []
      const allIssues: AgentIssue[] = []
      const steps: AgentStep[] = []

      const emitStep = (step: AgentStep) => {
        steps.push(step)
        sendStep(encoder, controller, step)
      }

      try {
        emitStep(createStep('planning', 'Creating implementation plan...'))
        
        const planPrompt = createPlanningPrompt(prompt)
        const plan = await generateWithLLM(model, planPrompt, planSchema) as AgentPlan
        
        emitStep(createStep('planning', `Plan created: ${plan.title}`, { plan }))

        emitStep(createStep('writing', 'Creating sandbox environment...'))
        sbx = await Sandbox.create('nextjs-agent-dev', {
          metadata: { prompt },
          timeoutMs: sandboxTimeout,
        })

        if (plan.dependencies.length > 0) {
          emitStep(createStep('writing', `Installing dependencies: ${plan.dependencies.join(', ')}`))
          await sbx.commands.run(`npm install ${plan.dependencies.join(' ')}`)
        }

        for (let i = 0; i < plan.pages.length; i++) {
          const page = plan.pages[i]
          emitStep(createStep('writing', `Generating page ${i + 1}/${plan.pages.length}: ${page.path}`))
          
          const codePrompt = createCodeGenPrompt(plan, i)
          const result = await generateWithLLM(model, codePrompt, filesSchema)
          
          for (const file of result.files) {
            await sbx.files.write(file.path, file.content)
            allFiles.push({ ...file, action: 'create' })
            emitStep(createStep('writing', `Created: ${file.path}`))
          }
        }

        emitStep(createStep('linting', 'Running ESLint...'))
        let lintResult = await runLint(sbx)
        allIssues.push(...lintResult.issues)

        emitStep(createStep('linting', 'Running TypeScript check...'))
        let typeResult = await runTypeCheck(sbx)
        allIssues.push(...typeResult.issues)

        let retries = 0
        while ((!lintResult.success || !typeResult.success) && retries < maxRetries) {
          retries++
          emitStep(createStep('fixing', `Fixing issues (attempt ${retries}/${maxRetries})...`))
          
          const errors = allIssues.filter(i => i.severity === 'error')
          const fixPrompt = createFixPrompt(allFiles, errors)
          const fixes = await generateWithLLM(model, fixPrompt, filesSchema)
          
          for (const file of fixes.files) {
            await sbx.files.write(file.path, file.content)
            const existingIdx = allFiles.findIndex(f => f.path === file.path)
            if (existingIdx >= 0) {
              allFiles[existingIdx] = { ...file, action: 'update' }
            } else {
              allFiles.push({ ...file, action: 'create' })
            }
            emitStep(createStep('fixing', `Fixed: ${file.path}`))
          }

          allIssues.length = 0
          lintResult = await runLint(sbx)
          allIssues.push(...lintResult.issues)
          typeResult = await runTypeCheck(sbx)
          allIssues.push(...typeResult.issues)
        }

        if (!skipBuild) {
          emitStep(createStep('building', 'Running production build...'))
          const buildResult = await runBuild(sbx)
          if (!buildResult.success) {
            emitStep(createStep('error', `Build failed: ${buildResult.error}`))
          }
        }

        emitStep(createStep('starting', 'Starting development server...'))
        
        const url = `https://${sbx.getHost(3000)}`
        
        emitStep(createStep('ready', 'Application is ready!', {
          sandboxId: sbx.sandboxId,
          url,
          plan,
          files: allFiles,
          issues: allIssues.filter(i => i.severity === 'warning')
        }))

        const finalResult = {
          success: true,
          sandboxId: sbx.sandboxId,
          url,
          plan,
          files: allFiles,
          issues: allIssues,
          steps
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', ...finalResult })}\n\n`))
        controller.close()

      } catch (error) {
        const errorStep = createStep('error', error instanceof Error ? error.message : 'Unknown error')
        emitStep(errorStep)
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete',
          success: false, 
          sandboxId: sbx?.sandboxId || '',
          files: allFiles,
          issues: allIssues,
          steps,
          error: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
