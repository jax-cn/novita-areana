'use client'

import { MarkdownRenderer } from './markdown-renderer'
import { useEffect, useRef } from 'react'

interface StreamingCodeDisplayProps {
  content: string
  reasoning?: string
  onPreview?: (html: string) => void
}

export function StreamingCodeDisplay({ content, reasoning, onPreview }: StreamingCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollPosition = useRef<number>(0)

  // 当内容更新时，保持滚动位置
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const isScrolledToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10

      // 如果用户已经滚动到底部，自动滚动到新内容
      if (isScrolledToBottom) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight
        }, 0)
      }
    }
  }, [content])

  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto p-4">
      <div className="max-w-none">
        <MarkdownRenderer content={content} reasoning={reasoning} onPreview={onPreview} />
      </div>
    </div>
  )
}
