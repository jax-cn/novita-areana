import { z } from 'zod'

export const AgentStepType = z.enum([
  'planning',
  'writing',
  'linting', 
  'building',
  'starting',
  'ready',
  'error',
  'fixing'
])

export type AgentStepType = z.infer<typeof AgentStepType>

export const AgentFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  action: z.enum(['create', 'update', 'delete']).default('create')
})

export type AgentFile = z.infer<typeof AgentFileSchema>

export const AgentIssueSchema = z.object({
  file: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  ruleId: z.string().optional()
})

export type AgentIssue = z.infer<typeof AgentIssueSchema>

export const AgentStepSchema = z.object({
  type: AgentStepType,
  message: z.string(),
  timestamp: z.number(),
  data: z.record(z.string(), z.unknown()).optional()
})

export type AgentStep = z.infer<typeof AgentStepSchema>

export const AgentPlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  pages: z.array(z.object({
    path: z.string(),
    purpose: z.string(),
    components: z.array(z.string())
  })),
  components: z.array(z.object({
    name: z.string(),
    purpose: z.string(),
    props: z.array(z.string()).optional()
  })),
  dependencies: z.array(z.string()),
  estimatedFiles: z.number()
})

export type AgentPlan = z.infer<typeof AgentPlanSchema>

export const AgentResultSchema = z.object({
  success: z.boolean(),
  sandboxId: z.string(),
  url: z.string().optional(),
  plan: AgentPlanSchema.optional(),
  files: z.array(AgentFileSchema),
  issues: z.array(AgentIssueSchema),
  steps: z.array(AgentStepSchema),
  error: z.string().optional()
})

export type AgentResult = z.infer<typeof AgentResultSchema>

export interface AgentWorkflowOptions {
  prompt: string
  model: {
    id: string
    provider: string
  }
  maxRetries?: number
  skipBuild?: boolean
  onStep?: (step: AgentStep) => void
}

export function createStep(type: AgentStepType, message: string, data?: Record<string, unknown>): AgentStep {
  return {
    type,
    message,
    timestamp: Date.now(),
    data
  }
}

export function formatIssuesForPrompt(issues: AgentIssue[]): string {
  if (issues.length === 0) return ''
  
  const grouped = issues.reduce((acc, issue) => {
    const key = issue.file || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(issue)
    return acc
  }, {} as Record<string, AgentIssue[]>)
  
  let output = 'The following issues were found:\n\n'
  
  for (const [file, fileIssues] of Object.entries(grouped)) {
    output += `File: ${file}\n`
    for (const issue of fileIssues) {
      const location = issue.line ? `Line ${issue.line}:${issue.column || 0}` : ''
      output += `  - [${issue.severity.toUpperCase()}] ${location} ${issue.message}`
      if (issue.ruleId) output += ` (${issue.ruleId})`
      output += '\n'
    }
    output += '\n'
  }
  
  return output
}
