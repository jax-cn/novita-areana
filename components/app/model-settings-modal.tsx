'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface ModelSettingsPopoverProps {
  children: React.ReactNode
  modelName: string
  settings: {
    temperature: number
  }
  onSettingsChange: (settings: any) => void
}

export function ModelSettingsPopover({
  children,
  modelName,
  settings,
  onSettingsChange,
}: ModelSettingsPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-[318px] p-0" align="end">
          <div className="bg-white border border-[#e7e6e2] rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-4">
              <h3 className="text-[18px] font-semibold text-[#101828] font-sans mb-6">
                Model Parameters
              </h3>
              
              <div className="space-y-6">
                {/* Temperature Setting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#4f4e4a] font-sans">
                        Temperature
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative group cursor-help">
                            <svg 
                              width="12" 
                              height="12" 
                              viewBox="0 0 12 12" 
                              fill="none" 
                              className="text-[#9e9c98]"
                            >
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
                              <path d="M6 4v4M6 9h0" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px]">
                          <p className="text-sm">
                            Controls randomness in responses. Lower values (0.1-0.3) make output more focused and deterministic. Higher values (0.7-1.0) make output more creative and varied. Default: 0.7
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="bg-[#f5f5f5] border border-[#e7e6e2] rounded px-2 py-0.5">
                      <span className="text-[12px] text-[#4f4e4a] font-mono">
                        {settings.temperature}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Slider
                      value={[settings.temperature]}
                      onValueChange={(value) => 
                        onSettingsChange({ ...settings, temperature: value[0] })
                      }
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}