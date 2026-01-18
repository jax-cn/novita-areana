'use client'

import { useState, useRef } from 'react'
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
  Eye,
  EyeOff,
  Square,
} from 'lucide-react'
import { ShareModal } from '@/components/app/share-modal'
import { UserAvatar } from '@/components/app/user-avatar'
import { StreamingCodeDisplay } from '@/components/playground/streaming-code-display'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { models, LLMModel } from '@/lib/models'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'
import { streamChatCompletion } from '@/lib/novita-api'
import { extractHTMLFromMarkdown } from '@/lib/html-extractor'

const NOVITA_API_KEY = 'sk_Y52XftPzTCOOrx9-oWJF_cRHUPWiZqirVYvov-qxWkA'

interface ModelResponse {
  content: string
  reasoning?: string
  loading: boolean
  completed: boolean
  html?: string
}

export default function PlaygroundPage() {
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [prompt, setPrompt] = useState(
    'create a iron man 3d model.'
  )
  const [showInputBar, setShowInputBar] = useState(true)

  const [selectedModelA, setSelectedModelA] = useState<LLMModel>(models[0])
  const [selectedModelB, setSelectedModelB] = useState<LLMModel>(models[1])

  const [modelAView, setModelAView] = useState<'code' | 'preview'>('code')
  const [modelBView, setModelBView] = useState<'code' | 'preview'>('code')

  const [modelAResponse, setModelAResponse] = useState<ModelResponse>({
    content: '',
    reasoning: '',
    loading: false,
    completed: false,
  })
  const [modelBResponse, setModelBResponse] = useState<ModelResponse>({
    content: '',
    reasoning: '',
    loading: false,
    completed: false,
  })

  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster')
  const [recordedFormat, setRecordedFormat] = useState<'webm' | 'mp4' | null>(null)

  const {
    isRecording,
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setModelAView('code')
    setModelBView('code')

    setModelAResponse({ content: '', reasoning: '', loading: true, completed: false })
    setModelBResponse({ content: '', reasoning: '', loading: true, completed: false })

    const messages = [
      {
        role: 'user',
        content: `Create a complete HTML file for: ${prompt}. 
Please provide the HTML code in a markdown code block with language "html". 
The HTML should be a self-contained, complete file with all necessary CSS and JavaScript included.`,
      },
    ]

    const modelAPromise = streamChatCompletion({
      apiKey: NOVITA_API_KEY,
      model: selectedModelA.id,
      messages,
      callbacks: {
        onChunk: (chunk) => {
          setModelAResponse((prev) => ({
            ...prev,
            content: prev.content + (chunk.content || ''),
            reasoning: prev.reasoning + (chunk.reasoning_content || ''),
          }))
        },
        onComplete: () => {
          setModelAResponse((prev) => {
            const html = extractHTMLFromMarkdown(prev.content)
            return {
              ...prev,
              loading: false,
              completed: true,
              html: html || undefined,
            }
          })
          if (modelBResponse.completed && modelBResponse.html) {
            setModelAView('preview')
            setModelBView('preview')
          }
        },
        onError: (error) => {
          console.error('Model A error:', error)
          setModelAResponse((prev) => ({
            ...prev,
            loading: false,
            completed: true,
            content: prev.content + '\n\nError: ' + error.message,
          }))
        },
      },
    })

    const modelBPromise = streamChatCompletion({
      apiKey: NOVITA_API_KEY,
      model: selectedModelB.id,
      messages,
      callbacks: {
        onChunk: (chunk) => {
          setModelBResponse((prev) => ({
            ...prev,
            content: prev.content + (chunk.content || ''),
            reasoning: prev.reasoning + (chunk.reasoning_content || ''),
          }))
        },
        onComplete: () => {
          setModelBResponse((prev) => {
            const html = extractHTMLFromMarkdown(prev.content)
            return {
              ...prev,
              loading: false,
              completed: true,
              html: html || undefined,
            }
          })
          if (modelAResponse.completed && modelAResponse.html) {
            setModelAView('preview')
            setModelBView('preview')
          }
        },
        onError: (error) => {
          console.error('Model B error:', error)
          setModelBResponse((prev) => ({
            ...prev,
            loading: false,
            completed: true,
            content: prev.content + '\n\nError: ' + error.message,
          }))
        },
      },
    })

    await Promise.allSettled([modelAPromise, modelBPromise])
  }


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
          <h1 className="text-[20px] font-semibold text-black tracking-tight font-sans">
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

      <main ref={previewContainerRef} className="flex flex-1 relative overflow-hidden">
        <div className="flex flex-1">
          {viewMode !== 'b' && (
            <div className="flex-1 flex flex-col border-r border-[#f4f4f5] bg-white relative overflow-hidden">
              <div className="h-16 border-b border-[#e7e6e2] flex items-center justify-between px-4 bg-white shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 h-8 px-3 py-1.5 bg-[#f5f5f5] rounded-lg hover:bg-[#e7e6e2] transition-colors cursor-pointer"
                    >
                      <span className={`size-5 rounded-sm ${selectedModelA.color}`} />
                      <span className="text-[16px] font-medium text-[#4f4e4a] font-sans">
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
                  <div className="flex bg-[#f5f5f5] p-0.5 rounded-lg border border-[#e7e6e2]">
                    <button
                      onClick={() => setModelAView('code')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        modelAView === 'code'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-[#666] hover:text-black'
                      }`}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setModelAView('preview')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        modelAView === 'preview'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-[#666] hover:text-black'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
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

              <div className="flex-1 overflow-hidden">
                {modelAView === 'code' ? (
                  <StreamingCodeDisplay
                    content={modelAResponse.content}
                    reasoning={modelAResponse.reasoning}
                  />
                ) : (
                  <div className="w-full h-full">
                    {modelAResponse.html ? (
                      <iframe
                        srcDoc={modelAResponse.html}
                        className="w-full h-full border-0"
                        title="Preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {modelAResponse.loading
                          ? 'Generating HTML...'
                          : 'No HTML available for preview'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode !== 'a' && (
            <div className="flex-1 flex flex-col bg-[rgba(250,250,250,0.5)] relative overflow-hidden">
              <div className="h-16 border-b border-[#e7e6e2] flex items-center justify-between px-4 bg-transparent shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 h-8 px-3 py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                    >
                      <span className={`size-5 rounded-sm ${selectedModelB.color}`} />
                      <span className="text-[16px] font-medium text-[#4f4e4a] font-sans">
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
                  <div className="flex bg-[#f5f5f5] p-0.5 rounded-lg border border-[#e7e6e2]">
                    <button
                      onClick={() => setModelBView('code')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        modelBView === 'code'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-[#666] hover:text-black'
                      }`}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setModelBView('preview')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        modelBView === 'preview'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-[#666] hover:text-black'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
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

              <div className="flex-1 overflow-hidden">
                {modelBView === 'code' ? (
                  <StreamingCodeDisplay
                    content={modelBResponse.content}
                    reasoning={modelBResponse.reasoning}
                  />
                ) : (
                  <div className="w-full h-full">
                    {modelBResponse.html ? (
                      <iframe
                        srcDoc={modelBResponse.html}
                        className="w-full h-full border-0"
                        title="Preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {modelBResponse.loading
                          ? 'Generating HTML...'
                          : 'No HTML available for preview'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showInputBar && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[720px] z-50">
            <div className="relative rounded-2xl shadow-[0px_20px_40px_-12px_rgba(0,0,0,0.15)] bg-white/80 backdrop-blur-xl border border-white/50 overflow-hidden">
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex gap-3 items-start min-h-[136px]">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-[#f1f5f9] rounded-full self-start">
                        <span className="size-2 rounded-full bg-[#2b7fff]" />
                        <span className="text-[14px] text-[#45556c] font-sans leading-5">HTML Generation</span>
                      </div>

                      <div className="text-[16px] text-[#4f4e4a] leading-6 font-sans">
                        {prompt || "Building your HTML page..."}
                      </div>
                    </div>

                    {(modelAResponse.loading || modelBResponse.loading) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 mt-6">
                        <div className="animate-spin size-4 border-2 border-[#23d57c] border-t-transparent rounded-full" />
                        Generating...
                      </div>
                    )}
                  </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f4f4f5]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-7 px-2.5 text-[12px] font-normal text-[#4f4e4a] hover:bg-muted/50 rounded-lg transition-colors cursor-pointer font-sans"
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

        {showInputBar && (
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
