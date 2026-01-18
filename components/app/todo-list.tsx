'use client';

import { Loader2, Server, Code, Rocket, Brain, MessageSquare, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThinkingProcess, ThinkingStep } from './thinking-process';

export type MainStepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

export interface MainStep {
  id: string;
  title: string;
  status: MainStepStatus;
  icon: typeof Server;
}

export interface AgentTodo {
  id: string;
  content: string;
  status: 'pending' | 'in-progress' | 'completed';
  activeForm: string;
}

export type AgentLogType =
  | 'info'              // General information
  | 'thinking'          // Claude's internal thinking
  | 'output'            // Claude's text response
  | 'tool_use'          // Tool being called
  | 'tool_executing'    // Tool is executing
  | 'tool_completed'    // Tool execution completed
  | 'success'           // Success message
  | 'error';            // Error message

export interface AgentLog {
  id: string;
  type: AgentLogType;
  message: string;
  timestamp: number;
}

export interface TodoListProps {
  mainSteps: MainStep[];
  activeStepId?: string;
  agentTodos?: AgentTodo[];
  agentLogs?: AgentLog[];
  thinkingSteps?: ThinkingStep[];
  error?: string;
}

const stepIcons = {
  creating: Server,
  building: Code,
  preview: Rocket,
};

const logIcons = {
  info: Info,
  thinking: Brain,
  output: MessageSquare,
  tool_use: AlertCircle,
  tool_executing: Loader2,
  tool_completed: CheckCircle2,
  success: CheckCircle2,
  error: AlertCircle,
};

const logEmojis = {
  info: 'ℹ️',
  thinking: '🧠',
  output: '💬',
  tool_use: '🔧',
  tool_executing: '⚙️',
  tool_completed: '✅',
  success: '✨',
  error: '❌',
};

export function TodoList({
  mainSteps,
  activeStepId,
  agentTodos = [],
  agentLogs = [],
  thinkingSteps = [],
  error,
}: TodoListProps) {
  return (
    <div className="space-y-4 relative">
      {mainSteps.map((step, index) => {
        const isLast = index === mainSteps.length - 1;
        const isActive = step.status === 'in-progress';
        const isCompleted = step.status === 'completed';
        const isError = step.status === 'error';

        return (
          <div key={step.id} className="relative">
            <div className="flex gap-4 items-start">
              {/* Connector line container */}
              <div className="flex flex-col items-center shrink-0">
                {/* Icon Container */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm z-10',
                    isCompleted && 'bg-[#f9fafb] border-[#e5e7eb]',
                    isActive && 'bg-[#caf6e0] border-[#caf6e0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]',
                    step.status === 'pending' && 'bg-white border-[#f3f4f6]',
                    isError && 'bg-red-50 border-red-200'
                  )}
                >
                  {isActive ? (
                    <Loader2 className="h-5 w-5 text-[#23d57c] animate-spin" />
                  ) : (
                    <step.icon
                      className={cn(
                        'h-5 w-5',
                        isCompleted && 'text-[#9ca3af]',
                        isActive && 'text-[#23d57c]',
                        step.status === 'pending' && 'text-[#d1d5dc]',
                        isError && 'text-red-500'
                      )}
                    />
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="w-px flex-1 bg-[#f3f4f6] mt-2" style={{ minHeight: isActive && step.id === 'building' ? '400px' : '30px' }} />
                )}
              </div>

              {/* Content Container */}
              <div className="flex-1 pb-4">
                <div
                  className={cn(
                    'flex items-center gap-3 h-[46px] rounded-2xl border bg-white px-4 shadow-sm',
                    isActive && 'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] border-[#e5e7eb]',
                    step.status !== 'in-progress' && 'border-[#e5e7eb]',
                    isError && 'border-red-500/50 bg-red-500/5'
                  )}
                >
                  <span
                    className={cn(
                      'text-[16px] font-medium font-[\'TT_Interphases_Pro\'] flex-1',
                      isActive && 'text-[#4f4e4a]',
                      step.status !== 'in-progress' && 'text-[#9e9c98]',
                      isError && 'text-red-600'
                    )}
                  >
                    {step.title}
                  </span>
                  
                  {/* Loading indicator for active step */}
                  {isActive && (
                    <Loader2 className="h-4 w-4 text-[#23d57c] animate-spin" />
                  )}
                </div>

                {/* Thinking Process - Shows under active Building step */}
                {isActive && step.id === 'building' && thinkingSteps.length > 0 && (
                  <div className="flex gap-6 items-start">
                    <div className="flex-1">
                      <ThinkingProcess
                        steps={thinkingSteps}
                        isCompleted={false}
                        duration="4.2s"
                      />
                    </div>
                  </div>
                )}

                {/* Agent todos and logs inside active Building step */}
                {isActive && step.id === 'building' && (agentTodos.length > 0 || agentLogs.length > 0) && (
                <div className="mt-4 space-y-3">
                  {/* Agent Todos */}
                  {agentTodos.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#cbc9c4] uppercase tracking-wider">
                        Tasks
                      </div>
                      <div className="space-y-1.5">
                        {agentTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={cn(
                              'flex items-start gap-2 text-xs rounded-md px-2 py-1.5 transition-colors',
                              todo.status === 'in-progress' && 'bg-[#23d57c]/5 border border-[#23d57c]/20',
                              todo.status === 'completed' && 'text-[#9e9c98]',
                              todo.status === 'pending' && 'text-[#9e9c98]/60'
                            )}
                          >
                            {todo.status === 'in-progress' ? (
                              <Loader2 className="h-3 w-3 shrink-0 mt-0.5 animate-spin text-[#23d57c]" />
                            ) : todo.status === 'completed' ? (
                              <div className="h-3 w-3 shrink-0 mt-0.5 rounded-full bg-[#23d57c]/50" />
                            ) : (
                              <div className="h-3 w-3 shrink-0 mt-0.5 rounded-full border border-[#9e9c98]/30" />
                            )}
                            <span className="flex-1">{todo.activeForm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Logs */}
                  {agentLogs.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#cbc9c4] uppercase tracking-wider">
                        Activity
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-[#9e9c98]/20 scrollbar-track-transparent">
                        {agentLogs.map((log) => {
                          return (
                            <div
                              key={log.id}
                              className={cn(
                                'flex items-start gap-2 text-xs font-mono rounded px-2 py-1.5 transition-colors',
                                log.type === 'info' && 'bg-gray-500/5 text-gray-600',
                                log.type === 'thinking' && 'bg-purple-500/5 text-purple-600',
                                log.type === 'output' && 'bg-blue-500/5 text-blue-600',
                                log.type === 'tool_use' && 'bg-orange-500/5 text-orange-600',
                                log.type === 'tool_executing' && 'bg-yellow-500/5 text-yellow-600',
                                log.type === 'tool_completed' && 'bg-green-500/5 text-green-600',
                                log.type === 'success' && 'bg-emerald-500/5 text-emerald-600',
                                log.type === 'error' && 'bg-red-500/10 text-red-600'
                              )}
                            >
                              <span className="shrink-0">
                                {logEmojis[log.type]}
                              </span>
                              <span className="line-clamp-2 flex-1">{log.message}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error message */}
              {isError && error && (
                <div className="mt-2 text-xs text-red-600">
                  {error}
                </div>
              )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
