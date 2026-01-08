import { cva, type VariantProps } from 'class-variance-authority';
import { ModelName } from '@/types';

const modelBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide shadow-sm',
  {
    variants: {
      model: {
        'Claude 3.5': 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
        'GPT-4o': 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
        'Llama 3': 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
        'DeepSeek': 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
        'GLM-4': 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        'Mistral': 'bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      model: 'Claude 3.5',
      size: 'md',
    },
  }
);

export interface ModelBadgeProps extends VariantProps<typeof modelBadgeVariants> {
  model: ModelName;
  showDot?: boolean;
}

export function ModelBadge({ model, size, showDot = false }: ModelBadgeProps) {
  return (
    <div className={modelBadgeVariants({ model, size })}>
      {showDot && (
        <span className="size-2 rounded-full bg-current" />
      )}
      {model}
    </div>
  );
}
