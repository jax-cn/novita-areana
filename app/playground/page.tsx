'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Video,
  Share,
  Maximize,
  ArrowUp,
  ArrowLeft,
  Wallet,
  SplitSquareHorizontal,
  Eye,
  EyeOff,
  Square,
} from 'lucide-react'
import { ShareModal } from '@/components/app/share-modal'
import { UserAvatar } from '@/components/app/user-avatar'
import { TodoList } from '@/components/app/todo-list'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { models, LLMModel } from '@/lib/models'
import { useSandboxAgent } from '@/hooks/use-sandbox-agent'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'

export default function PlaygroundPage() {
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [prompt, setPrompt] = useState(
    'Make a mobile ordering app for a coffee shop with a modern minimal white design.'
  )
  const [showInputBar, setShowInputBar] = useState(true)

  const [selectedModelA, setSelectedModelA] = useState<LLMModel>(models[0])
  const [selectedModelB, setSelectedModelB] = useState<LLMModel>(models[1])

  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster')
  const [recordedFormat, setRecordedFormat] = useState<'webm' | 'mp4' | null>(null)

  // Use screen recorder hook
  const {
    isRecording,
    recordingTime,
    recordedBlob,
    previewContainerRef,
    startRecording,
    stopRecording,
  } = useScreenRecorder({
    onRecordingComplete: (blob, format) => {
      console.log('Recording complete:', { blob, format })
      setRecordedFormat(format)
      setShareMode('video')
      setTimeout(() => setShowShareModal(true), 300)
    },
    onError: (error) => {
      console.error('Recording error:', error)
    },
  })

  // Model A: Sandbox flow
  const {
    mainSteps: mainStepsA,
    agentTodos: agentTodosA,
    agentLogs: agentLogsA,
    previewUrl: previewUrlA,
    isLoading: isLoadingA,
    error: errorA,
    generate: generateA,
    abort: abortA,
  } = useSandboxAgent({
    onPreviewReady: (url) => {
      console.log('Preview ready:', url)
    },
    onError: (err) => {
      console.error('Model A error:', err)
    },
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording()
      setShowInputBar(true)
    } else {
      setShowInputBar(false)
      await startRecording()
    }
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return

    // Only generate for Model A (sandbox flow)
    generateA(prompt, selectedModelA.id)
  }

  const handleStop = () => {
    abortA()
  }

  const isAnyLoading = isLoadingA

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/50">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-lg hover:bg-muted/80 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3"></div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size={isRecording ? 'default' : 'icon'}
            className={`rounded-lg hover:bg-foreground hover:text-background transition-colors cursor-pointer ${
              isRecording ? 'gap-2 px-3 h-9' : 'size-9'
            }`}
            onClick={handleRecordToggle}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 fill-red-500 text-red-500" />
                <span className="text-sm font-mono">
                  {formatTime(recordingTime)}
                </span>
              </>
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-lg hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            title="Share"
            onClick={() => {
              setShareMode('poster')
              setShowShareModal(true)
            }}
          >
            <Share className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              $1,250.00
            </span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <UserAvatar />
        </div>
      </header>

      <main className="flex flex-1 relative overflow-hidden">
        <div className="flex flex-1 flex-col min-w-[300px] relative group/panel">
          <div
            className={`flex-1 m-3 rounded-xl overflow-hidden shadow-sm border bg-muted/30 relative ${
              viewMode === 'split' ? 'flex overflow-x-auto' : ''
            }`}
          >
            {(viewMode === 'split' || viewMode === 'a') && (
              <div
                ref={previewContainerRef}
                className={`relative transition-all duration-300 bg-background shrink-0 ${
                  viewMode === 'split'
                    ? 'min-w-[600px] w-1/2 border-r border-border'
                    : 'w-full h-full'
                }`}
                style={{
                  aspectRatio: viewMode === 'split' ? '4/3' : undefined,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${selectedModelA.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedModelA.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                      onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                      title={viewMode === 'a' ? 'Split view' : 'Fullscreen'}
                    >
                      {viewMode === 'a' ? (
                        <SplitSquareHorizontal className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {previewUrlA && !isLoadingA ? (
                  <iframe
                    src={previewUrlA}
                    className="w-full h-full pt-10 border-0"
                    title="Preview"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 p-8">
                    <div className="w-full max-w-sm">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          {isLoadingA ? 'Processing' : 'Ready'}
                        </span>
                        {isLoadingA && (
                          <span className="flex size-2 relative">
                            <span
                              className={`absolute inline-flex h-full w-full rounded-full ${selectedModelA.color} opacity-75 animate-ping`}
                            />
                            <span className={`relative inline-flex rounded-full size-2 ${selectedModelA.color}`} />
                          </span>
                        )}
                      </div>
                      <TodoList
                        mainSteps={mainStepsA}
                        agentTodos={agentTodosA}
                        agentLogs={agentLogsA}
                        error={errorA ?? undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {(viewMode === 'split' || viewMode === 'b') && (
              <div
                className={`relative transition-all duration-300 bg-background shrink-0 ${
                  viewMode === 'split' ? 'min-w-[600px] w-1/2' : 'w-full h-full'
                }`}
                style={{
                  aspectRatio: viewMode === 'split' ? '4/3' : undefined,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${selectedModelB.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedModelB.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                      onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                      title={viewMode === 'b' ? 'Split view' : 'Fullscreen'}
                    >
                      {viewMode === 'b' ? (
                        <SplitSquareHorizontal className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 p-8">
                  <div className="w-full max-w-sm text-center">
                    <div className="mb-4">
                      <span className={`inline-flex size-2 rounded-full ${selectedModelB.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Model B is temporarily disabled
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Only Model A is active for sandbox testing
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showInputBar && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
            <div className="relative rounded-2xl shadow-2xl bg-background/80 backdrop-blur-xl border border-white/20 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
              <div className="flex flex-col p-1">
                <div className="flex items-end gap-2 p-2">
                  <div className="flex-1 min-h-[56px] relative">
                    <Textarea
                      placeholder="Describe the app you want to build..."
                      className="w-full h-14 min-h-[56px] max-h-40 bg-transparent border-0 resize-none focus-visible:ring-0 p-2 text-base leading-relaxed placeholder:text-muted-foreground/50 font-medium"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isAnyLoading}
                    />
                  </div>
                  <Button
                    onClick={isAnyLoading ? handleStop : handleGenerate}
                    size="icon"
                    className="mb-1 size-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 group shrink-0"
                    disabled={!prompt.trim() && !isAnyLoading}
                  >
                    {isAnyLoading ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-auto px-2 py-1 text-xs font-semibold border-border rounded-lg transition-colors cursor-pointer hover:bg-foreground hover:text-background"
                        >
                          <span
                            className={`size-2 rounded-full ${selectedModelA.color}`}
                          />
                          {selectedModelA.name}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => setSelectedModelA(model)}
                            className="gap-2 cursor-pointer"
                          >
                            <span
                              className={`size-2 rounded-full ${model.color}`}
                            />
                            {model.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-xs font-bold text-muted-foreground">
                      VS
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-auto px-2 py-1 text-xs font-semibold border-border rounded-lg transition-colors cursor-pointer hover:bg-foreground hover:text-background"
                        >
                          <span
                            className={`size-2 rounded-full ${selectedModelB.color}`}
                          />
                          {selectedModelB.name}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => setSelectedModelB(model)}
                            className="gap-2 cursor-pointer"
                          >
                            <span
                              className={`size-2 rounded-full ${model.color}`}
                            />
                            {model.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setShowInputBar(false)}
                      title="Hide input bar"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showInputBar && !isRecording && (
          <Button
            onClick={() => setShowInputBar(true)}
            size="sm"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 gap-2 px-4 py-2 rounded-full shadow-lg cursor-pointer"
            title="Show input bar"
          >
            <Eye className="h-4 w-4" />
            Show Input
          </Button>
        )}
      </main>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        mode={shareMode}
        appName={`${selectedModelA.name} vs ${selectedModelB.name} - ${new Date().toLocaleDateString()}`}
        shareUrl={`novita.ai/battle/${selectedModelA.id}-vs-${selectedModelB.id}`}
        videoBlob={recordedBlob}
        videoFormat={recordedFormat}
      />
    </div>
  )
}
