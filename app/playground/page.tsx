'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StepIndicator } from '@/components/app/step-indicator';
import { Box, Video, Share, RefreshCw, Maximize, ArrowUp, History, Image as ImageIcon, Settings, Circle } from 'lucide-react';
import { StepConfig } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const steps: StepConfig[] = [
  {
    title: 'Analyze Requirements',
    status: 'completed',
    icon: 'check',
  },
  {
    title: 'Generate Component Structure',
    status: 'in-progress',
    icon: 'account-tree',
    codePreview: `<span class="text-purple-600">import</span> <span class="text-gray-800">React</span> <span class="text-purple-600">from</span> <span class="text-green-600">'react'</span>;\n<span class="text-blue-600">const</span> <span class="text-yellow-600">DarkLuxuryApp</span> <span class="text-gray-500">=</span> <span class="text-gray-500">()</span> <span class="text-blue-600">=></span> <span class="text-gray-500">{</span>\n  <span class="text-blue-600">return</span> <span class="text-gray-500">(</span>\n    <span class="text-gray-500 pl-8">&lt;div className="bg-neutral-900..."&gt;</span><span class="w-2 h-3 bg-primary inline-block animate-pulse"></span>`,
  },
  {
    title: 'Apply Tailwind Styles',
    status: 'pending',
    icon: 'brush',
  },
  {
    title: 'Render Preview',
    status: 'pending',
    icon: 'play-circle',
  },
];

export default function PlaygroundPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0 z-30">
        <div className="flex items-center gap-3 w-64">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Box className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Creation Playground</h1>
        </div>

        <div className="flex items-center gap-3 w-64 justify-end">
          <Link href="/recording">
            <Button
              variant="default"
              size="sm"
              className="gap-2 h-9"
            >
              <Circle className="h-4 w-4 fill-red-500 text-red-500" />
              Start Recording
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 rounded-lg bg-muted hover:bg-muted/80"
          >
            <Video className="h-5 w-5" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-red-500 animate-pulse" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg bg-muted hover:bg-muted/80"
          >
            <Share className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-accent ring-2 ring-background shadow-sm cursor-pointer" />
        </div>
      </header>

      <main className="flex flex-1 relative overflow-hidden">
        {/* Left Panel - Preview */}
        <div className="flex flex-1 flex-col min-w-[300px] relative group/panel">
          <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover/panel:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/90 backdrop-blur shadow-sm border hover:text-primary"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/90 backdrop-blur shadow-sm border hover:text-primary"
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 m-3 rounded-xl overflow-hidden shadow-sm border bg-background relative">
            <div className="w-full h-full overflow-y-auto bg-background">
              <div className="max-w-md mx-auto py-12 px-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-xl tracking-tighter text-primary">
                    BREW.
                  </span>
                  <button className="p-2 hover:bg-muted rounded">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>

                <h2 className="text-4xl font-bold mb-6 leading-tight">
                  Morning <br />
                  Rituals.
                </h2>

                <div className="aspect-[4/3] rounded-2xl bg-muted mb-6 relative overflow-hidden group">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMFhfgOeLY5e9o2Jvpe_ljiYLvI9044sT9-7kU-XoyX-enB6F6-UFJiJNGBusGi-FkJsWHPobiJTSJHLp_5sO8-4qa0aBQs-wZu3ws7IFOMtFAz2BdEntQib_QiJebg6Zm0Y01kSTZH6Gi_hJTLNt65Gon7clXi340aKd7E_PUK1uxNxeGDDEhhuv0jbUBROIzv9KFbQF9roVcrdIexxOOUgmskh4HzVpLtYcd40zKWQjjURbLgTpsYWg6GInwom8NDl7p_MbXLwY")',
                    }}
                  />
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4">
                  <div className="min-w-[100px] p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary font-bold mb-1">POPULAR</p>
                    <p className="font-medium text-sm">Oat Flat White</p>
                    <p className="text-xs text-muted-foreground mt-1">$4.50</p>
                  </div>
                  <div className="min-w-[100px] p-3 rounded-xl border">
                    <p className="text-xs text-muted-foreground font-bold mb-1">
                      NEW
                    </p>
                    <p className="font-medium text-sm">Matcha Tonic</p>
                    <p className="text-xs text-muted-foreground mt-1">$5.20</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 z-20">
              <div className="bg-background/90 backdrop-blur shadow-sm border text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                GPT-4o
              </div>
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div className="w-2 flex items-center justify-center cursor-col-resize hover:bg-primary/20 transition-colors z-20 group/divider">
          <div className="h-12 w-1 rounded-full bg-muted group-hover/divider:bg-primary transition-colors" />
        </div>

        {/* Right Panel - Steps */}
        <div className="flex flex-1 flex-col min-w-[300px] relative border-l">
          <div className="flex-1 m-3 rounded-xl overflow-hidden shadow-sm border bg-background relative flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Model Status
                  </span>
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    Planning Execution
                    <span className="flex size-2 relative">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full size-2 bg-orange-500" />
                    </span>
                  </h3>
                </div>
                <div className="text-xs text-muted-foreground font-mono">00:03</div>
              </div>

              <StepIndicator steps={steps} />
            </div>
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-40">
          <div className="rounded-2xl shadow-xl bg-background/95 backdrop-blur-xl border-2 border-transparent bg-gradient-to-r from-border via-primary to-border p-[2px]">
            <div className="flex flex-col bg-background rounded-xl p-2">
              <div className="flex items-end gap-2 p-1">
                <div className="flex-1 min-h-[56px] relative">
                  <Textarea
                    placeholder="Describe the app you want to build..."
                    className="w-full h-14 min-h-[56px] max-h-40 bg-transparent border-0 resize-none focus-visible:ring-0 p-3 text-base leading-relaxed placeholder:text-muted-foreground"
                    defaultValue="Make a mobile ordering app for a coffee shop. Left one should be modern minimal white, right one should be dark mode luxury."
                  />
                </div>
                <Button
                  size="icon"
                  className="mb-1 size-10 rounded-full bg-primary hover:bg-primary/90 text-background shadow-md transition-transform active:scale-95 group shrink-0"
                >
                  <ArrowUp className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>

              <div className="flex items-center justify-between px-4 pb-2 pt-1 border-t">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 px-2 py-1 h-auto text-xs font-medium"
                      >
                        <span className="size-2 rounded-full bg-primary" />
                        GPT-4o
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>Claude 3.5</DropdownMenuItem>
                      <DropdownMenuItem>Llama 3</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Separator orientation="vertical" className="h-3" />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-auto px-2 py-1 text-xs"
                  >
                    <History className="h-3.5 w-3.5" />
                    History
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-auto px-2 py-1 text-xs text-muted-foreground"
                  >
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Reference
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-auto px-2 py-1 text-xs text-muted-foreground"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
