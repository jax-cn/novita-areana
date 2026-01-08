'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, GitFork } from 'lucide-react';
import { AppCard as AppCardType } from '@/types';
import { ModelBadge } from './model-badge';

interface AppCardProps {
  app: AppCardType;
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Card className="group relative flex flex-col overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${app.thumbnail})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-foreground shadow-lg">
            <GitFork className="h-6 w-6" />
          </div>
        </div>
        <div className="absolute right-3 top-3">
          <ModelBadge model={app.model} size="sm" />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="mb-1 text-lg font-bold leading-tight group-hover:text-primary">
            {app.title}
          </h3>
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            by{' '}
            <span className="cursor-pointer hover:underline">
              @{app.author}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs font-bold uppercase tracking-wide"
          >
            <GitFork className="h-4 w-4" />
            Fork
          </Button>
          <button className="group/like flex items-center gap-1 text-muted-foreground transition-colors hover:text-red-500">
            <Heart className="h-5 w-5 group-hover/like:fill-current" />
            <span className="text-xs font-semibold">
              {app.likes >= 1000 ? `${(app.likes / 1000).toFixed(1)}k` : app.likes}
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
}
