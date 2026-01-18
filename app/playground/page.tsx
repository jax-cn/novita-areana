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

  // Mock thinking steps for demonstration
  const mockThinkingSteps = [
    { id: '1', message: 'Analyzing user request for an AI comparison interface...' },
    { id: '2', message: 'Identifying key components: Split layout, Model selectors, Status timeline.' },
    { id: '3', message: 'Checking UI libraries... Framer Motion for animations, Tailwind for styling.' },
    { id: '4', message: 'Structuring the React component hierarchy.' },
    { id: '5', message: 'Drafting the response with the requested split-screen layout.' },
  ];

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
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <header className="flex h-16 items-center justify-between border-b border-[#f3f4f6] bg-white px-4 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full hover:bg-muted/80 cursor-pointer p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-[20px] font-semibold text-black tracking-tight font-['TT_Interphases_Pro']">
            Arena Playground
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-lg border-[#e4e4e7] hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            onClick={handleRecordToggle}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <Square className="h-4 w-4 fill-red-500 text-red-500" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-lg border-[#e4e4e7] hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            title="Share"
            onClick={() => {
              setShareMode('poster')
              setShowShareModal(true)
            }}
          >
            <Share className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f5] rounded-lg border border-[#e7e6e2]">
            <Wallet className="h-4 w-4 text-[#3f3f46]" />
            <span className="text-sm font-semibold text-[#3f3f46] tracking-tight">
              $1,250.00
            </span>
          </div>

          <UserAvatar />
        </div>
      </header>

      <main className="flex flex-1 relative overflow-hidden">
        <div className="flex flex-1">
          {/* Model A Panel */}
          <div className="flex-1 flex flex-col border-r border-[#f4f4f5] bg-white relative overflow-hidden">
            {/* Model A Header */}
            <div className="h-16 border-b border-[#e7e6e2] flex items-center justify-between px-4 bg-white shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 h-8 px-3 py-1.5 bg-[#f5f5f5] rounded-lg hover:bg-[#e7e6e2] transition-colors cursor-pointer"
                  >
                    <span className={`size-5 rounded-sm ${selectedModelA.color}`} />
                    <span className="text-[16px] font-medium text-[#4f4e4a] font-['TT_Interphases_Pro']">
                      {selectedModelA.name}
                    </span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="#9e9c98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => setSelectedModelA(model)}
                      className="gap-2 cursor-pointer"
                    >
                      <span className={`size-5 rounded-sm ${model.color}`} />
                      {model.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="6" width="4" height="2" rx="1" fill="#9e9c98"/>
                    <rect x="8" y="6" width="10" height="2" rx="1" fill="#9e9c98"/>
                    <rect x="2" y="12" width="10" height="2" rx="1" fill="#9e9c98"/>
                    <rect x="14" y="12" width="4" height="2" rx="1" fill="#9e9c98"/>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg hover:bg-muted/80 cursor-pointer"
                  onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                >
                  <Maximize className="h-4 w-4 text-[#9e9c98]" />
                </Button>
              </div>
            </div>

            {/* Model A Content */}
            <div className="flex-1 overflow-auto bg-white">
              {previewUrlA && !isLoadingA ? (
                <iframe
                  ref={previewContainerRef}
                  src={previewUrlA}
                  className="w-full h-full border-0"
                  title="Preview"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-lg">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs text-[#cbc9c4] uppercase tracking-widest font-medium font-['TT_Interphases_Pro']">
                        STATUS
                      </span>
                      <span className="text-xs text-[#cbc9c4] font-medium font-['TT_Interphases_Pro']">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                    <TodoList
                      mainSteps={mainStepsA}
                      agentTodos={agentTodosA}
                      agentLogs={agentLogsA}
                      thinkingSteps={isLoadingA ? mockThinkingSteps : []}
                      error={errorA ?? undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Model B Panel */}
          <div className="flex-1 flex flex-col bg-[rgba(250,250,250,0.5)] relative overflow-hidden">
            {/* Model B Header */}
            <div className="h-16 border-b border-[#e7e6e2] flex items-center justify-between px-4 bg-transparent shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 h-8 px-3 py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                  >
                    <span className={`size-5 rounded-sm ${selectedModelB.color}`} />
                    <span className="text-[16px] font-medium text-[#4f4e4a] font-['TT_Interphases_Pro']">
                      {selectedModelB.name}
                    </span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="#9e9c98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => setSelectedModelB(model)}
                      className="gap-2 cursor-pointer"
                    >
                      <span className={`size-5 rounded-sm ${model.color}`} />
                      {model.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="6" width="4" height="2" rx="1" fill="#9e9c98"/>
                    <rect x="8" y="6" width="10" height="2" rx="1" fill="#9e9c98"/>
                    <rect x="2" y="12" width="10" height="2" rx="1" fill="#9e9c98"/>
                    <rect x="14" y="12" width="4" height="2" rx="1" fill="#9e9c98"/>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg hover:bg-muted/80 cursor-pointer"
                  onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                >
                  <Maximize className="h-4 w-4 text-[#9e9c98]" />
                </Button>
              </div>
            </div>

            {/* Model B Content - Offline State */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-xs">
                <div className="mb-4">
                  <span className="inline-block size-2 rounded-full bg-[#2b7fff] shadow-[0_0_0_4px_#eff6ff]" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#4f4e4a] mb-4 tracking-tight font-['TT_Interphases_Pro']">
                  Model B is currently offline
                </h3>
                <p className="text-[16px] text-[#9e9c98] mb-6 leading-6 font-['TT_Interphases_Pro']">
                  This model is undergoing maintenance. Please use {selectedModelA.name} for your current tasks.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 text-xs font-normal border-[#e7e6e2] rounded hover:bg-muted/50 cursor-pointer font-['TT_Interphases_Pro']"
                >
                  Check Status
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showInputBar && isLoadingA && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[720px] z-50">
            <div className="relative rounded-2xl shadow-[0px_20px_40px_-12px_rgba(0,0,0,0.15)] bg-white/80 backdrop-blur-xl border border-white/50 overflow-hidden">
              <div className="flex flex-col gap-2 p-4">
                {/* Message Area */}
                <div className="flex gap-3 items-start min-h-[136px]">
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Website Badge */}
                    <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-[#f1f5f9] rounded-full self-start">
                      <span className="size-2 rounded-full bg-[#2b7fff]" />
                      <span className="text-[14px] text-[#45556c] font-['TT_Interphases_Pro'] leading-5">Website</span>
                    </div>
                    
                    {/* Message Text */}
                    <div className="text-[16px] text-[#4f4e4a] leading-6 font-['TT_Interphases_Pro']">
                      {prompt || "Building your application..."}
                    </div>
                  </div>
                  
                  {/* Stop Button */}
                  <Button
                    onClick={handleStop}
                    size="icon"
                    className="size-9 rounded-xl bg-[#23d57c] hover:bg-[#23d57c]/90 shadow-[0px_10px_15px_-3px_#a4f4cf,0px_4px_6px_-4px_#a4f4cf] shrink-0 mt-6"
                  >
                    <Square className="h-4 w-4 text-white" />
                  </Button>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f4f4f5]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-9 px-3.5 py-2.5 text-[14px] font-medium text-[#4f4e4a] border-[#e7e6e2] rounded-lg hover:bg-muted/50 cursor-pointer font-['TT_Interphases_Pro']"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="12" height="12" rx="2" stroke="#4f4e4a" strokeWidth="1.5"/>
                        </svg>
                        Image
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6L8 10L12 6" stroke="#9e9c98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-32">
                      <DropdownMenuItem className="cursor-pointer">Image</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Video</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Code</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-7 px-2.5 text-[12px] font-normal text-[#4f4e4a] hover:bg-muted/50 rounded-lg transition-colors cursor-pointer font-['TT_Interphases_Pro']"
                    onClick={() => setShowInputBar(false)}
                    title="Hide controls"
                  >
                    <EyeOff className="h-4 w-4" />
                    Hide controls
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showInputBar && !isLoadingA && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
            <div className="relative rounded-2xl shadow-2xl bg-white/80 backdrop-blur-xl border border-white/20 overflow-hidden">
              <div className="flex flex-col p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-h-[56px] relative">
                    <Textarea
                      placeholder="Describe the app you want to build..."
                      className="w-full h-14 min-h-[56px] max-h-40 bg-transparent border-0 resize-none focus-visible:ring-0 p-2 text-base leading-relaxed placeholder:text-muted-foreground/50 font-medium font-['TT_Interphases_Pro']"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleGenerate}
                    size="icon"
                    className="mb-1 size-10 rounded-xl bg-[#23d57c] hover:bg-[#23d57c]/90 text-white shadow-lg shadow-[#23d57c]/20 transition-all active:scale-95 group shrink-0"
                    disabled={!prompt.trim()}
                  >
                    <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
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
