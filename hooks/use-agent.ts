'use client'

import { useState, useCallback, useRef } from 'react'
import { AgentStep, AgentResult, AgentPlan, AgentFile, AgentIssue } from '@/lib/agent-workflow'
import { LLMModel } from '@/lib/models'

export interface UseAgentOptions {
  onStep?: (step: AgentStep) => void
  onComplete?: (result: AgentResult) => void
  onError?: (error: Error) => void
}

export interface UseAgentReturn {
  submit: (prompt: string, model: LLMModel) => void
  stop: () => void
  isLoading: boolean
  steps: AgentStep[]
  result: AgentResult | null
  error: Error | null
  plan: AgentPlan | null
  files: AgentFile[]
  issues: AgentIssue[]
  currentStep: AgentStep | null
}

export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const { onStep, onComplete, onError } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [result, setResult] = useState<AgentResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [plan, setPlan] = useState<AgentPlan | null>(null)
  const [files, setFiles] = useState<AgentFile[]>([])
  const [issues, setIssues] = useState<AgentIssue[]>([])
  const [currentStep, setCurrentStep] = useState<AgentStep | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const submit = useCallback(async (prompt: string, model: LLMModel) => {
    setIsLoading(true)
    setSteps([])
    setResult(null)
    setError(null)
    setPlan(null)
    setFiles([])
    setIssues([])
    setCurrentStep(null)

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'complete') {
                const agentResult: AgentResult = {
                  success: data.success,
                  sandboxId: data.sandboxId,
                  url: data.url,
                  plan: data.plan,
                  files: data.files || [],
                  issues: data.issues || [],
                  steps: data.steps || [],
                  error: data.error,
                }
                setResult(agentResult)
                setFiles(agentResult.files)
                setIssues(agentResult.issues)
                if (agentResult.plan) setPlan(agentResult.plan)
                onComplete?.(agentResult)
              } else {
                const step = data as AgentStep
                setSteps(prev => [...prev, step])
                setCurrentStep(step)
                
                if (step.data?.plan) {
                  setPlan(step.data.plan as AgentPlan)
                }
                if (step.data?.files) {
                  setFiles(step.data.files as AgentFile[])
                }
                if (step.data?.issues) {
                  setIssues(step.data.issues as AgentIssue[])
                }
                
                onStep?.(step)
              }
            } catch {
              console.warn('Failed to parse SSE data:', line)
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [onStep, onComplete, onError])

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  return {
    submit,
    stop,
    isLoading,
    steps,
    result,
    error,
    plan,
    files,
    issues,
    currentStep,
  }
}
