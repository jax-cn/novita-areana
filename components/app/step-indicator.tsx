'use client';

import { Check, Network, Brush, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepConfig } from '@/types';

const iconMap = {
  check: Check,
  'account-tree': Network,
  brush: Brush,
  'play-circle': PlayCircle,
};

export function StepIndicator({ steps }: { steps: StepConfig[] }) {
  return (
    <div className="space-y-4 relative">
      {steps.map((step, index) => {
        const Icon = iconMap[step.icon as keyof typeof iconMap] || Check;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className={cn('relative pl-12', step.status === 'in-progress' && 'loading-shimmer')}>
            {!isLast && (
              <div
                className={cn(
                  'step-connector absolute left-6 top-10 bottom-[-24px] w-0.5 -translate-x-1/2 z-0',
                  step.status === 'completed' && 'bg-primary',
                  step.status === 'in-progress' && 'bg-gradient-to-b from-primary to-muted',
                  step.status === 'pending' && 'bg-muted'
                )}
              />
            )}
            <div
              className={cn(
                'absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg border z-10',
                step.status === 'completed' && 'bg-background border-border',
                step.status === 'in-progress' && 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(35,213,124,0.1)]',
                step.status === 'pending' && 'bg-background border-border opacity-40'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  step.status === 'completed' && 'text-primary',
                  step.status === 'in-progress' && 'text-primary animate-pulse',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              />
            </div>
            <div
              className={cn(
                'rounded-lg border bg-background p-3',
                step.status === 'in-progress' && 'border-primary p-4 shadow-lg',
                step.status !== 'in-progress' && 'border-border'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'font-medium',
                    step.status === 'in-progress' && 'text-sm font-bold',
                    step.status !== 'in-progress' && 'text-sm'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {step.status === 'in-progress' && step.codePreview && (
                <div className="mt-3 space-y-2 font-mono text-[10px] text-muted-foreground bg-muted p-2 rounded border border-border overflow-hidden">
                  {step.codePreview.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-2">
                      <span dangerouslySetInnerHTML={{ __html: line }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
