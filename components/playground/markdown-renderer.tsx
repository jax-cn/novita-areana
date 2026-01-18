'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Code2, Eye } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  reasoning?: string
  onPreview?: (html: string) => void
}

export function MarkdownRenderer({ content, reasoning, onPreview }: MarkdownRendererProps) {
  const [showReasoning, setShowReasoning] = useState(false)

  // 使用useMemo来优化性能，确保在流式更新时减少不必要的重新渲染
  const memoizedContent = useMemo(() => content, [content])

  return (
    <div className="w-full space-y-4">
      {reasoning && (
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50/50 transition-colors cursor-pointer w-full text-left"
          >
            {showReasoning ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>Thinking Process</span>
          </button>
          {showReasoning && (
            <div className="border-t border-gray-100 p-4 bg-gray-50/30">
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {reasoning}
              </div>
            </div>
          )}
        </div>
      )}

      <ReactMarkdown
        key={memoizedContent} // 添加key确保内容更新时重新渲染
        remarkPlugins={[remarkGfm]}
        components={{
              code(props) {
                const { node, inline, className, children, ...rest } = props as any
                
                // 更精确地检测内联代码
                // 内联代码通常没有className或者inline为true
                const isInlineCode = inline || (!className && !String(children).includes('\n'))

                // 确保内联代码（单个反引号）正确渲染为内联样式
                if (isInlineCode) {
                  return (
                    <code
                      className="px-2 py-1 bg-gray-100 rounded-md text-sm font-mono text-gray-800 break-words"
                      {...rest}
                    >
                      {children}
                    </code>
                  )
                }

                // 代码块（三个反引号）渲染为完整的代码块
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : 'plaintext'
                const codeString = String(children).replace(/\n$/, '')

                // 为每个代码块生成唯一的key，确保在内容更新时能正确重新渲染
                const codeBlockKey = `${language}-${codeString.slice(0, 50)}-${codeString.length}`

                return (
                  <div key={codeBlockKey} className="my-4 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-medium capitalize">
                          {language}
                        </span>
                      </div>
                      {language === 'html' && onPreview && (
                        <button
                          onClick={() => onPreview(codeString)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                      )}
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      <SyntaxHighlighter
                        style={oneLight}
                        language={language}
                        PreTag="div"
                        showLineNumbers={false}
                        wrapLines={true}
                        wrapLongLines={true}
                        customStyle={{
                          margin: 0,
                          padding: '1.25rem',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          background: 'transparent',
                          overflow: 'auto',
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )
              },
              p: ({ children, ...props }) => (
                <p className="text-gray-700 leading-7 mb-3" {...props}>
                  {children}
                </p>
              ),
              h1: ({ children, ...props }) => (
                <h1 className="text-2xl font-bold text-gray-900 mb-3 mt-5" {...props}>
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 className="text-xl font-semibold text-gray-900 mb-2 mt-4" {...props}>
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 className="text-lg font-medium text-gray-900 mb-2 mt-3" {...props}>
                  {children}
                </h3>
              ),
              ul: ({ children, ...props }) => (
                <ul className="list-disc list-inside text-gray-700 space-y-0.5 mb-3" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ children, ...props }) => (
                <ol className="list-decimal list-inside text-gray-700 space-y-0.5 mb-3" {...props}>
                  {children}
                </ol>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 mb-3" {...props}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {memoizedContent}
          </ReactMarkdown>
    </div>
  )
}
