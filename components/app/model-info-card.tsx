import { Coins, Timer } from 'lucide-react';
import { ModelName } from '@/types';
import { cn } from '@/lib/utils';

interface ModelInfoCardProps {
  model: ModelName;
  tokens: string;
  time: string;
}

const modelColors: Record<ModelName, string> = {
  'Claude 3.5': 'bg-purple-500',
  'GPT-4o': 'bg-green-500',
  'Llama 3': 'bg-orange-500',
  'DeepSeek': 'bg-blue-500',
  'GLM-4': 'bg-red-500',
  'Mistral': 'bg-cyan-500',
};

export function ModelInfoCard({ model, tokens, time }: ModelInfoCardProps) {
  return (
    <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 p-3 shadow-lg border border-border backdrop-blur-md dark:bg-black/80 flex flex-col gap-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn('w-2 h-2 rounded-full', modelColors[model])} />
        <span className="text-xs font-bold uppercase tracking-wide">
          {model}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-1">
          <Coins className="h-3.5 w-3.5" />
          <span>{tokens}</span>
        </div>
        <div className="flex items-center gap-1">
          <Timer className="h-3.5 w-3.5" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
