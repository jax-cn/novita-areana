'use client';

import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { X, Trophy, Gift, Calendar, Users, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArenaBattleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArenaBattleModal({ open, onOpenChange }: ArenaBattleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[544px] max-h-[90vh] overflow-y-auto bg-black border-[rgba(13,84,43,0.5)] p-0 rounded-[10px]">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-[#fdc700]" />
            <h2 className="text-white text-[32px] font-semibold leading-[40px] tracking-[-0.64px] font-['TT_Interphases_Pro',sans-serif]">
              Novita Arena Battle
            </h2>
          </div>
          <h3 className="text-[#05df72] text-[18px] font-semibold leading-6 font-['TT_Interphases_Pro',sans-serif]">
            Build it. Compare it. Make it glow.
          </h3>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="px-6 pb-6 space-y-8">
          {/* Promo Banner */}
          <div className="bg-[rgba(13,84,43,0.1)] border-l-4 border-[rgba(0,201,80,0.5)] rounded-br-[10px] rounded-tr-[10px] p-4">
            <p className="text-[#e7e6e2] text-base leading-6 font-['TT_Interphases_Pro',sans-serif]">
              A 14-day, fully remote Model Arena battle focused on visual comparison, vibes, and shareability — not traditional hackathon code volume.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* What You'll Build */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#fdc700]" />
                <h3 className="text-white text-2xl font-semibold leading-[38px] font-['TT_Interphases_Pro',sans-serif]">
                  What You'll Build
                </h3>
              </div>
              
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-5 space-y-3">
                <p className="text-[#d1d5dc] text-sm leading-5 font-['TT_Interphases_Pro',sans-serif]">
                  Create visual, comparable demos using <span className="font-semibold text-[#f5f5f5]">Novita Model Arena</span>, focusing on Particle Effects.
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm leading-5 font-['TT_Interphases_Pro',sans-serif]">
                    <span className="font-bold text-[#7bf1a8]">Core idea:</span>
                    <span className="text-[#cbc9c4]"> Use the same prompt across different models and showcase output differences in style, motion, and vibe.</span>
                  </p>
                  
                  <ul className="space-y-1 text-[#cbc9c4] text-sm leading-5 font-['TT_Interphases_Pro',sans-serif]">
                    <li>Different models, same prompt</li>
                    <li>Visual contrast worth sharing</li>
                    <li>Energy, Motion, Abstract Vibe, Sci-Fi</li>
                  </ul>
                </div>
                
                <p className="text-[#6a7282] text-xs leading-5 font-['TT_Interphases_Pro_Mono',sans-serif] tracking-[0.24px]">
                  No requirement for a full product, repo, or complex system.
                </p>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#fdc700]" />
                <h3 className="text-white text-2xl font-semibold leading-[38px] font-['TT_Interphases_Pro',sans-serif]">
                  Prize Pool
                </h3>
              </div>
              
              <div className="space-y-3">
                {/* 1st Place */}
                <div className="bg-gradient-to-r from-[rgba(115,62,10,0.2)] to-[rgba(0,0,0,0)] border border-[rgba(240,177,0,0.2)] rounded-[14px] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <span className="text-[#fff085] text-base font-bold">1st Place</span>
                  </div>
                  <span className="text-white text-base font-medium">$500 Credits</span>
                </div>

                {/* 2nd Place */}
                <div className="bg-gradient-to-r from-[rgba(30,41,57,0.4)] to-[rgba(0,0,0,0)] border border-[rgba(106,114,130,0.2)] rounded-[14px] p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🥈</span>
                    <span className="text-[#d1d5dc] text-base font-medium">2nd Place</span>
                  </div>
                  <span className="text-white text-base font-medium">$200 Credits</span>
                </div>

                {/* 3rd Place */}
                <div className="bg-gradient-to-r from-[rgba(126,42,12,0.2)] to-[rgba(0,0,0,0)] border border-[rgba(255,105,0,0.2)] rounded-[14px] p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🥉</span>
                    <span className="text-[#ffd6a7] text-base font-medium">3rd Place</span>
                  </div>
                  <span className="text-white text-base font-medium">$100 Credits</span>
                </div>

                {/* 4th-10th Place */}
                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] rounded-[14px] p-3 flex items-center justify-between">
                  <span className="text-[#cbc9c4] text-sm font-medium">4th - 10th Place</span>
                  <span className="text-[#e7e6e2] text-base font-medium">$50 Credits</span>
                </div>

                {/* Community Bonus */}
                <div className="bg-[rgba(13,84,43,0.2)] border border-[rgba(0,201,80,0.2)] rounded-[10px] p-2.5">
                  <p className="text-[#23d57c] text-sm leading-5 font-['TT_Interphases_Pro',sans-serif]">
                    Community Bonus: $30 Credits for high-quality feedback
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#fdc700]" />
              <h3 className="text-white text-xl font-bold leading-7 tracking-[-0.45px] font-['Inter',sans-serif]">
                Timeline (Fully Remote)
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-4 text-center space-y-1">
                <p className="text-[#05df72] text-base font-bold tracking-[-0.31px]">Build & Submit</p>
                <p className="text-[#99a1af] text-sm tracking-[-0.15px]">Day 0 – Day 14</p>
              </div>
              
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-4 text-center space-y-1">
                <p className="text-[#51a2ff] text-base font-bold tracking-[-0.31px]">Review Period</p>
                <p className="text-[#99a1af] text-sm tracking-[-0.15px]">Day 15 – Day 18</p>
              </div>
              
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-4 text-center space-y-1">
                <p className="text-[#c27aff] text-base font-bold tracking-[-0.31px]">Winners Announced</p>
                <p className="text-[#99a1af] text-sm tracking-[-0.15px]">Day 18 – Day 21</p>
              </div>
            </div>
          </div>

          {/* How to Participate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#fdc700]" />
              <h3 className="text-white text-xl font-bold leading-7 tracking-[-0.45px] font-['Inter',sans-serif]">
                How to Participate
              </h3>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-4 relative overflow-hidden">
                <div className="absolute top-[-8px] right-2 text-[60px] font-bold text-[rgba(255,255,255,0.05)] leading-[60px] tracking-[0.26px]">
                  1
                </div>
                <div className="relative z-10 space-y-2">
                  <h4 className="text-white text-[18px] font-bold leading-7 tracking-[-0.44px]">Use Arena</h4>
                  <p className="text-[#99a1af] text-xs leading-4">
                    Compare at least 2 models (e.g. GLM 5.0 vs Minimax 2.5)
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-4 relative overflow-hidden">
                <div className="absolute top-[-8px] right-2 text-[60px] font-bold text-[rgba(255,255,255,0.05)] leading-[60px] tracking-[0.26px]">
                  2
                </div>
                <div className="relative z-10 space-y-2">
                  <h4 className="text-white text-[18px] font-bold leading-7 tracking-[-0.44px]">Showcase</h4>
                  <p className="text-[#99a1af] text-xs leading-4">
                    Create a short video (≤ 60s). Demo link optional.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-4 relative overflow-hidden">
                <div className="absolute top-[-8px] right-2 text-[60px] font-bold text-[rgba(255,255,255,0.05)] leading-[60px] tracking-[0.26px]">
                  3
                </div>
                <div className="relative z-10 space-y-2">
                  <h4 className="text-white text-[18px] font-bold leading-7 tracking-[-0.44px]">Post on X</h4>
                  <p className="text-[#99a1af] text-xs leading-4">
                    Tag @Novita #NovitaArena #VibeCoding
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-4 relative overflow-hidden">
                <div className="absolute top-[-8px] right-2 text-[60px] font-bold text-[rgba(255,255,255,0.05)] leading-[60px] tracking-[0.26px]">
                  4
                </div>
                <div className="relative z-10 space-y-2">
                  <h4 className="text-white text-[18px] font-bold leading-7 tracking-[-0.44px]">Submit</h4>
                  <p className="text-[#99a1af] text-xs leading-4">
                    Share Twitter link in Discord #arena-showcase
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: How You're Judged & Why Join */}
          <div className="grid grid-cols-2 gap-8">
            {/* How You're Judged */}
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-5 space-y-3">
              <h4 className="text-white text-base font-bold tracking-[-0.31px]">How You're Judged</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#d1d5dc] text-sm tracking-[-0.15px]">Public Twitter Engagement</span>
                    <span className="text-[#05df72] text-sm font-bold tracking-[-0.15px]">50%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-[#00c950]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#d1d5dc] text-sm tracking-[-0.15px]">Novita Team Review</span>
                    <span className="text-[#51a2ff] text-sm font-bold tracking-[-0.15px]">50%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-[#2b7fff]" />
                  </div>
                </div>

                <p className="text-[#6a7282] text-xs leading-4">
                  Criteria: Visual impact, vibe, comparison clarity.
                </p>
              </div>
            </div>

            {/* Why Join */}
            <div className="rounded-[14px] border border-[rgba(0,201,80,0.2)] p-5 space-y-3" style={{ backgroundImage: 'linear-gradient(135.11deg, rgba(13, 84, 43, 0.2) 0%, rgb(0, 0, 0) 100%)' }}>
              <h4 className="text-white text-base font-bold tracking-[-0.31px]">Why Join?</h4>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#23d57c] mt-0.5 flex-shrink-0" />
                  <span className="text-[#d1d5dc] text-sm leading-5 tracking-[-0.15px]">
                    Try cutting-edge models side by side
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#23d57c] mt-0.5 flex-shrink-0" />
                  <span className="text-[#d1d5dc] text-sm leading-5 tracking-[-0.15px]">
                    Create viral, visual AI demos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#23d57c] mt-0.5 flex-shrink-0" />
                  <span className="text-[#d1d5dc] text-sm leading-5 tracking-[-0.15px]">
                    Get rewarded for insight, not code volume
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-black border-t border-[rgba(255,255,255,0.1)] px-6 py-6 flex flex-col items-center gap-4">
          <Button 
            className="w-full max-w-[420px] h-12 bg-[#23d57c] hover:bg-[#1fc76f] text-black text-base font-normal font-['TT_Interphases_Pro_Mono',monospace] rounded-[14px] shadow-[0px_0px_20px_0px_rgba(34,197,94,0.3)]"
            onClick={() => window.open('https://discord.gg/novita', '_blank')}
          >
            👉 Join via Discord
          </Button>
          <p className="text-[#6a7282] text-sm tracking-[-0.15px] italic text-center">
            Build fast. Compare clearly. Make it share-worthy.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
