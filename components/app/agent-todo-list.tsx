'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TodoItem {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface AgentTodoListProps {
  todos: TodoItem[];
  title?: string;
}

export function AgentTodoList({ todos, title = 'TODO' }: AgentTodoListProps) {
  if (todos.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#364153] font-['Inter'] uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-[12px] text-[#99a1af] font-['Inter']">
          {todos.filter(t => t.status === 'completed').length}/{todos.length}
        </span>
      </div>

      {/* Todo Items */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border transition-all',
              todo.status === 'completed' && 'bg-white border-[#e5e7eb] opacity-60',
              todo.status === 'in-progress' && 'bg-[#f0fdf4] border-[#86efac]',
              todo.status === 'pending' && 'bg-white border-[#e5e7eb]'
            )}
          >
            {/* Status Icon */}
            <div className="shrink-0 mt-0.5">
              {todo.status === 'completed' && (
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              )}
              {todo.status === 'in-progress' && (
                <Loader2 className="w-4 h-4 text-[#22c55e] animate-spin" />
              )}
              {todo.status === 'pending' && (
                <Circle className="w-4 h-4 text-[#d1d5dc]" />
              )}
            </div>

            {/* Todo Text */}
            <p
              className={cn(
                'text-[13px] font-["Inter"] leading-[20px] flex-1',
                todo.status === 'completed' && 'text-[#6b7280] line-through',
                todo.status === 'in-progress' && 'text-[#374151] font-medium',
                todo.status === 'pending' && 'text-[#6b7280]'
              )}
            >
              {todo.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
