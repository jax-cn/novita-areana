'use client';

import { Server, Code, Eye, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepConfig } from '@/types';

const iconMap = {
  check: Check,
  server: Server,
  code: Code,
  eye: Eye,
};

export function StepIndicator({ steps }: { steps: StepConfig[] }) {
  return (
    <div className="space-y-4 relative">
      {steps.map((step, index) => {
        const Icon = iconMap[step.icon as keyof typeof iconMap] || Check;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex gap-4 items-center relative">
            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-6 top-12 h-16 w-px -translate-x-1/2 z-0',
                  step.status === 'completed' && 'bg-[#f4f4f5]',
                  step.status === 'in-progress' && 'bg-[#f4f4f5]',
                  step.status === 'pending' && 'bg-[#f4f4f5]'
                )}
              />
            )}
            
            {/* Icon Container */}
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm z-10 shrink-0',
                step.status === 'completed' && 'bg-white border-[#e4e4e7]',
                step.status === 'in-progress' && 'bg-white border-[#e4e4e7] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]',
                step.status === 'pending' && 'bg-white border-[#e4e4e7]'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  step.status === 'completed' && 'text-[#cbc9c4]',
                  step.status === 'in-progress' && 'text-[#23d57c]',
                  step.status === 'pending' && 'text-[#cbc9c4]'
                )}
              />
            </div>
            
            {/* Content Container */}
            <div
              className={cn(
                'flex-1 rounded-2xl border bg-white p-4 shadow-sm',
                step.status === 'in-progress' && 'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]',
                step.status !== 'in-progress' && 'border-[#e4e4e7]'
              )}
            >
              <span
                className={cn(
                  'text-[16px] font-medium font-[\'TT_Interphases_Pro\']',
                  step.status === 'in-progress' && 'text-[#4f4e4a]',
                  step.status !== 'in-progress' && 'text-[#9e9c98]'
                )}
              >
                {step.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
