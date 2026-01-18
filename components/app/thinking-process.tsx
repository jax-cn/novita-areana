'use client';

import { Brain, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface ThinkingStep {
  id: string;
  message: string;
}

export interface ThinkingProcessProps {
  steps: ThinkingStep[];
  isCompleted?: boolean;
  duration?: string;
}

export function ThinkingProcess({
  steps,
  isCompleted = false,
  duration = '4.2s',
}: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="ml-14 mt-4 w-full">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full h-10 mb-2 group"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-[#f5f5f5] rounded-lg">
            <Brain className="w-4 h-4 text-[#4a5565]" />
          </div>
          <span className="text-[14px] font-medium text-[#364153] font-['Inter']">
            Thinking Process
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#99a1af] font-['Inter']">
            {duration}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#99a1af]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#99a1af]" />
          )}
        </div>
      </button>

      {/* Thinking Steps */}
      {isExpanded && (
        <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-2xl p-4">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-2 items-start">
                <span className="text-[13px] text-[#d1d5dc] font-['Inter'] shrink-0">-</span>
                <p className="text-[13px] text-[#4a5565] font-['Inter'] leading-[21px]">
                  {step.message}
                </p>
              </div>
            ))}
          </div>

          {/* Status Footer */}
          {isCompleted && (
            <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[#e5e7eb]/50">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00bc7d] opacity-80" />
              <span className="text-[12px] font-medium text-[#096] font-['Inter']">
                Plan formulated
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
