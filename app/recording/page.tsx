'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RecordingIndicator } from '@/components/app/recording-indicator';
import { ModelInfoCard } from '@/components/app/model-info-card';
import { ShareModal } from '@/components/app/share-modal';
import { Pause, Check, Columns } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModelName } from '@/types';

interface BattlePreview {
  model: ModelName;
  score: number;
  tokens: string;
  time: string;
}

const battlePreviews: BattlePreview[] = [
  {
    model: 'Claude 3.5',
    score: 12,
    tokens: '2,405 toks',
    time: '8.2s',
  },
  {
    model: 'GPT-4o',
    score: 8,
    tokens: '2,110 toks',
    time: '6.8s',
  },
];

export default function RecordingPage() {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Blurred Background */}
      <div className="absolute inset-0 z-0 flex flex-col opacity-20 pointer-events-none select-none overflow-hidden">
        <div className="h-16 border-b bg-muted flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-primary rounded-md" />
            <div className="h-4 w-32 bg-muted rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-muted/50 rounded-md" />
            <div className="h-9 w-9 bg-muted rounded-full" />
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r bg-muted flex flex-col gap-4 p-4 shrink-0">
            <div className="h-8 w-full bg-muted/50 rounded-md" />
            <div className="h-8 w-3/4 bg-muted/50 rounded-md" />
            <div className="h-8 w-5/6 bg-muted/50 rounded-md" />
            <div className="mt-auto h-32 w-full bg-muted/30 rounded-md" />
          </div>
          <main className="flex-1 bg-muted/30 p-8 grid grid-cols-2 gap-6">
            <div className="bg-background h-64 rounded-xl shadow-sm" />
            <div className="bg-background h-64 rounded-xl shadow-sm" />
            <div className="bg-background h-64 rounded-xl shadow-sm col-span-2" />
          </main>
        </div>
      </div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10" />

      {/* Recording Interface */}
      <div className="relative z-20 flex h-full w-full flex-col">
        {/* Header */}
        <div className="h-16 bg-background border-b shrink-0 flex items-center justify-between px-6 shadow-md z-30 relative">
          <RecordingIndicator duration="00:12" />

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 shadow-sm"
                >
                  <Columns className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-bold">Battle Mode</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem>Side by Side</DropdownMenuItem>
                <DropdownMenuItem>Split Vertical</DropdownMenuItem>
                <DropdownMenuItem>Picture in Picture</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="default" className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button variant="ghost" size="default">
              Cancel
            </Button>
            <Button
              size="default"
              className="gap-2 shadow-sm"
              onClick={() => setShowShareModal(true)}
            >
              <Check className="h-4 w-4" />
              Done
            </Button>
          </div>
        </div>

        {/* Battle Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-full max-w-[1400px] h-full flex gap-6">
            {battlePreviews.map((preview, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col relative group"
              >
                {/* Preview Card */}
                <div className="flex-1 bg-sky-400 rounded-xl overflow-hidden shadow-2xl border-4 border-background relative">
                  {/* Clouds */}
                  <div className="absolute top-10 left-10 w-16 h-8 bg-white/80 rounded-full animate-float" />
                  <div
                    className="absolute top-20 right-20 w-20 h-10 bg-white/60 rounded-full animate-float"
                    style={{ animationDelay: '1s' }}
                  />

                  {/* Pipes */}
                  <div className="absolute top-0 right-32 h-40 w-16 bg-green-500 border-x-4 border-b-4 border-green-700" />
                  <div className="absolute bottom-16 right-32 h-48 w-16 bg-green-500 border-x-4 border-t-4 border-green-700" />

                  {/* Character */}
                  <div className="absolute top-1/2 left-20 w-10 h-10 bg-yellow-400 rounded-full border-2 border-foreground flex items-center justify-center z-10 shadow-lg">
                    <div className="absolute right-1 top-2 w-3 h-3 bg-background rounded-full border border-foreground">
                      <div className="absolute right-0.5 top-1 w-1 h-1 bg-foreground rounded-full" />
                    </div>
                    <div className="absolute -right-2 top-5 w-4 h-3 bg-orange-500 rounded-r-lg border border-foreground" />
                    <div className="absolute -left-2 top-4 w-4 h-3 bg-background rounded-full border border-foreground -rotate-12" />
                  </div>

                  {/* Ground */}
                  <div className="absolute bottom-0 w-full h-16 bg-[#ded895] border-t-4 border-[#73bf2e]">
                    <div className="w-full h-2 bg-[#73bf2e] opacity-50" />
                  </div>

                  {/* Score */}
                  <div className="absolute top-10 w-full text-center">
                    <span className="text-4xl font-bold text-background drop-shadow-lg">
                      {preview.score}
                    </span>
                  </div>
                </div>

                {/* Model Info Card */}
                <ModelInfoCard
                  model={preview.model}
                  tokens={preview.tokens}
                  time={preview.time}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-20px);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
