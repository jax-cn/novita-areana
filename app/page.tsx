'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/app/app-card';
import { UserAvatar } from '@/components/app/user-avatar';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { ArenaBattleModal } from '@/components/app/arena-battle-modal';
import { Plus, TrendingUp, Clock, Box, ArrowRight, Code, Image as ImageIcon, Video, PenTool, Gamepad2, Settings, Sparkles, FileText, ChevronDown } from 'lucide-react';
import { AppCard as AppCardType } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { useState, useEffect } from 'react';

const mockApps: AppCardType[] = [
  {
    id: '1',
    title: 'Gravity Data Sim',
    author: 'phys_wiz',
    modelA: 'Claude 3.5',
    modelB: 'GPT-4o',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7alA6GSnzYKzv_iaaBMefKcuGt-BkmdeBPvOY92u9GY-TmgSU5wEb_P42t8BvLMnNxVJx-okzDsQsMjXxc09WcJ8ejLlUQOk2yNkF8h4v6fnhSpIssjEf4WtTUFM2MpEhSgXUfpiwH9Fjjqg-jb6K0ssOJ7vwYjJne-U--Sz3Vbd6rKGoz5gEpbsr1-AbjiQ-TsguOACGmJ1s4ZWzTyj4ADWizlpFjLRqpsX6jPszN2reOc53QZUGnC9MzuCQrr3ptjpMn8epE_Q',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7alA6GSnzYKzv_iaaBMefKcuGt-BkmdeBPvOY92u9GY-TmgSU5wEb_P42t8BvLMnNxVJx-okzDsQsMjXxc09WcJ8ejLlUQOk2yNkF8h4v6fnhSpIssjEf4WtTUFM2MpEhSgXUfpiwH9Fjjqg-jb6K0ssOJ7vwYjJne-U--Sz3Vbd6rKGoz5gEpbsr1-AbjiQ-TsguOACGmJ1s4ZWzTyj4ADWizlpFjLRqpsX6jPszN2reOc53QZUGnC9MzuCQrr3ptjpMn8epE_Q',
    category: 'Website',
    likes: 1200,
  },
  {
    id: '2',
    title: 'Snake 3D Remake',
    author: 'retro_dev',
    modelA: 'GPT-4o',
    modelB: 'Claude 3.5',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFRFUClCq6ybiXEKjq22HMXbWLz4q_L7gbZYs4SxYwIfzFWWZzJMvUD2YSPIWrNwmdCPqareipI9KHu79oNhUyKy3C5v6fVVToev9lceJHNFMTfwtkxmF3Jc-HIgBWfkwvdqJe9hz9D43JIAXX7XNdedPoseJ7andHLaf8IqFIJF1f0plJpbg5qwWJgcfToO-hRadiE7RzszYTN3O1-mHoUKPLyPesFlUWWYjT-RQdX9NvJ4FYQIcIdk1IXBd9Bp9Pf4S7Wk0hu_U',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFRFUClCq6ybiXEKjq22HMXbWLz4q_L7gbZYs4SxYwIfzFWWZzJMvUD2YSPIWrNwmdCPqareipI9KHu79oNhUyKy3C5v6fVVToev9lceJHNFMTfwtkxmF3Jc-HIgBWfkwvdqJe9hz9D43JIAXX7XNdedPoseJ7andHLaf8IqFIJF1f0plJpbg5qwWJgcfToO-hRadiE7RzszYTN3O1-mHoUKPLyPesFlUWWYjT-RQdX9NvJ4FYQIcIdk1IXBd9Bp9Pf4S7Wk0hu_U',
    category: 'Game',
    likes: 850,
  },
  {
    id: '3',
    title: 'Particle Controller',
    author: 'threejs_god',
    modelA: 'Claude 3.5',
    modelB: 'Llama 3',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnVMAVAfPY-z3xydBc4GuaP646hDi3d0JTEOxFh4-ZISxgrX6llG36-AbgsYvMAcVmhbmGPu9Ib2YmWNrnhIjyHaE47I6trYyJ1xk44D_rNQbSMISFwY7PQIixZpaQm3yCOVoTSrMpGz9fNxWFgG4CRvdywfL0CHUqGjSlYhgI4Z5Ptir0riDNgj7NA6ATgdvUqn-PeOsK6K17fbusw3Duq7cNHdEnVM6Ygca472YCz2ilhlw66GskDBlY-KGIDmBZTeZea-tQwdE',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnVMAVAfPY-z3xydBc4GuaP646hDi3d0JTEOxFh4-ZISxgrX6llG36-AbgsYvMAcVmhbmGPu9Ib2YmWNrnhIjyHaE47I6trYyJ1xk44D_rNQbSMISFwY7PQIixZpaQm3yCOVoTSrMpGz9fNxWFgG4CRvdywfL0CHUqGjSlYhgI4Z5Ptir0riDNgj7NA6ATgdvUqn-PeOsK6K17fbusw3Duq7cNHdEnVM6Ygca472YCz2ilhlw66GskDBlY-KGIDmBZTeZea-tQwdE',
    category: '3D Scene',
    likes: 2100,
  },
  {
    id: '4',
    title: 'Cloth Physics Demo',
    author: 'sim_master',
    modelA: 'Llama 3',
    modelB: 'GPT-4o',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg6VNqDZan7bxkNmvSno_pJ8p0TnF1grXxABXL15oRk9NOwgMdo8XfzjhW0r_m8DnbE35YCB-BD9NJz6fCInZO_OxnHjuzQOOSy9OlPA_ntO-sybaPiBoN4--WOGOsHdFxLkgqENco3GUHeJ9UzDbZqbggbEXfPGlWCjGgoK8C7ScTWMrLg6s3hv6DWlQm_trv-P87NW5EufWTgfxUq42ZETz2C9OSR_edIX9uS3f6zoF8fTI_w-_X5q7yIQBDYQOAEiTdQBGRV-Y',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg6VNqDZan7bxkNmvSno_pJ8p0TnF1grXxABXL15oRk9NOwgMdo8XfzjhW0r_m8DnbE35YCB-BD9NJz6fCInZO_OxnHjuzQOOSy9OlPA_ntO-sybaPiBoN4--WOGOsHdFxLkgqENco3GUHeJ9UzDbZqbggbEXfPGlWCjGgoK8C7ScTWMrLg6s3hv6DWlQm_trv-P87NW5EufWTgfxUq42ZETz2C9OSR_edIX9uS3f6zoF8fTI_w-_X5q7yIQBDYQOAEiTdQBGRV-Y',
    category: 'Physics',
    likes: 932,
  },
  {
    id: '5',
    title: 'Fluid Rain Sim',
    author: 'weather_ai',
    modelA: 'GPT-4o',
    modelB: 'Claude 3.5',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDilnTv7FHR-fvz6wlAd_WKWQAS5SD4MRnAQc9LdcYWGZa58a1laOPLNAN1vk2hS5NUhh0I-gaps1OyZa8PtqePVPsrC77fZH6v6IDwy0u5sz3OCOT92TmQEjz02MSJEQkWqshsPKJwaDnB5_f1hkpgz_P4Gi0bEj80qXVKzunBQNVsdbiVq32DZFIuujk9oz7xKjfcPz_YLWbe4TCAKRREy-8XxRaZk9jfNXFpgNycSfbZ6eiArosR6jonNsFkhmyEsZy9us9uPcc',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDilnTv7FHR-fvz6wlAd_WKWQAS5SD4MRnAQc9LdcYWGZa58a1laOPLNAN1vk2hS5NUhh0I-gaps1OyZa8PtqePVPsrC77fZH6v6IDwy0u5sz3OCOT92TmQEjz02MSJEQkWqshsPKJwaDnB5_f1hkpgz_P4Gi0bEj80qXVKzunBQNVsdbiVq32DZFIuujk9oz7xKjfcPz_YLWbe4TCAKRREy-8XxRaZk9jfNXFpgNycSfbZ6eiArosR6jonNsFkhmyEsZy9us9uPcc',
    category: 'Visual Effect',
    likes: 4500,
  },
  {
    id: '6',
    title: 'Pong: Neon Edition',
    author: 'arcade_lover',
    modelA: 'Claude 3.5',
    modelB: 'GPT-4o',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqGBqc3-YVTMgfmeXXMm0pYx7umPRuT7qhMosgCoIcST2TVDPSMj9utb4wMAKBjGe6VLGpb4Zf_obyAMMBZnz1GMiCxYQa2lF0ROOrde9p249X2LZKU_oxxfK0MVYD8DVGwcH9krPGaCppv4XIfN5lpUVm5Sc33xvUJRO8Ntn8oe0bKwNOG9RJd5OxGhlA5ExhFsJqxNH4gWkEoUkvygtsLr8_WYim4Ffe9FP_d3_ynSDocCxXazq85J43B5as87Z8fULoji_P6aI',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqGBqc3-YVTMgfmeXXMm0pYx7umPRuT7qhMosgCoIcST2TVDPSMj9utb4wMAKBjGe6VLGpb4Zf_obyAMMBZnz1GMiCxYQa2lF0ROOrde9p249X2LZKU_oxxfK0MVYD8DVGwcH9krPGaCppv4XIfN5lpUVm5Sc33xvUJRO8Ntn8oe0bKwNOG9RJd5OxGhlA5ExhFsJqxNH4gWkEoUkvygtsLr8_WYim4Ffe9FP_d3_ynSDocCxXazq85J43B5as87Z8fULoji_P6aI',
    category: 'Game',
    likes: 156,
  },
];

const categories = [
  { name: 'Trending', icon: TrendingUp },
  { name: 'Newest', icon: Clock },
];

const modes = [
  { label: 'Website', icon: Code, color: 'bg-teal-400/80' },
  { label: 'Image', icon: ImageIcon, color: 'bg-indigo-400/80' },
  { label: 'Video', icon: Video, color: 'bg-rose-400/80' },
  { label: 'Logo', icon: PenTool, color: 'bg-amber-400/80' },
  { label: 'Image Editing', icon: Settings, color: 'bg-cyan-400/80' },
  { label: 'Game Dev', icon: Gamepad2, color: 'bg-purple-400/80' },
  { label: '3D Design', icon: Box, color: 'bg-blue-400/80' },
];

const modePrompts: Record<string, string[]> = {
  'Website': [
    "Build me a minimalistic dashboard for tracking my personal expenses...",
    "Create a landing page for a new coffee brand with scroll animations...",
    "Design a portfolio site with dark mode and a contact form..."
  ],
  'Image': [
    "A cyberpunk city street at night with neon lights and rain...",
    "A portrait of a futuristic astronaut in a garden of alien plants...",
    "A wide angle shot of a serene mountain lake at sunrise..."
  ],
  'Video': [
    "A time-lapse video of a flower blooming in a forest...",
    "A drone shot flying over a busy futuristic metropolis...",
    "Slow motion waves crashing on a black sand beach..."
  ],
  'Logo': [
    "A minimalist geometric logo for a tech startup called 'Nexus'...",
    "A vintage style badge logo for a coffee shop...",
    "An abstract icon representing connection and speed..."
  ],
  'Image Editing': [
    "Remove the background from this portrait and add a studio backdrop...",
    "Color correct this landscape to look like golden hour...",
    "Add a lens flare effect to the top right corner..."
  ],
  'Game Dev': [
    "Create a basic Flappy Bird element with physics...",
    "Build a 2D platformer character controller with double jump...",
    "A simple memory card game grid with flip animations..."
  ],
  '3D Design': [
    "A 3D rotating globe with data visualization points...",
    "A low poly forest scene with volumetric lighting...",
    "A physics simulation of falling cloth over a sphere..."
  ]
};

export default function HomePage() {
  const [activeMode, setActiveMode] = useState('Website');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const activePrompts = modePrompts[activeMode] || modePrompts['Website'];
    const i = loopNum % activePrompts.length;
    const fullText = activePrompts[i];

    const handleTyping = () => {
      setPlaceholderText(isDeleting 
        ? fullText.substring(0, placeholderText.length - 1) 
        : fullText.substring(0, placeholderText.length + 1)
      );

      setTypingSpeed(isDeleting ? 20 : 50);

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); // Pause before deleting
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, activeMode, typingSpeed]);

  // Reset typewriter when mode changes
  useEffect(() => {
    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setPlaceholderText('');
      setIsDeleting(false);
      setLoopNum(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full px-6 py-16">
          <div className="mx-auto flex max-w-[896px] flex-col items-center gap-8 text-center">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-[#f0fdf4] border border-[#b9f8cf] rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#00c950]" />
              <span className="text-[#00a63e] text-xs font-medium font-['Inter',sans-serif]">
                Novita AI Engine v2.0 is live
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-[819px] text-[#292827] text-[80px] font-semibold leading-[74px] tracking-[-1.6px] font-['TT_Interphases_Pro',sans-serif]">
              <span className="text-[#292827]">Generate anything, </span>
              <span className="text-black">Share the magic.</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[672px] text-[#4f4e4a] text-lg font-normal leading-6 font-['TT_Interphases_Pro',sans-serif]">
              Explore thousands of apps generated by the community. Fork, remix, and display in seconds. The future of creation is here.
            </p>

            {/* Textarea Input Section */}
            <div className="w-full max-w-[787px] flex flex-col items-center gap-5">
              {/* Textarea Box */}
              <div className="w-full bg-white border border-[#e7e6e2] rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col gap-2">
                  {/* Mode Badge */}
                  <div className="inline-flex self-start items-center gap-2 px-2 py-1.5 bg-[#f1f5f9] rounded-full">
                    <div className="w-2 h-2 rounded-full bg-[#2b7fff]" />
                    <span className="text-[#45556c] text-sm font-normal font-['TT_Interphases_Pro',sans-serif]">
                      {activeMode}
                    </span>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={placeholderText}
                    placeholder="Describe what you want to create..."
                    readOnly
                    className="w-full min-h-[82px] resize-none bg-transparent text-[#4f4e4a] text-base font-normal leading-6 font-['TT_Interphases_Pro',sans-serif] outline-none placeholder:text-[#9e9c98]"
                  />

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-4">
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                    >
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    
                    <Link href="/playground">
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#292827] rounded-xl text-white text-base font-normal font-['TT_Interphases_Pro_Mono',monospace] hover:bg-[#3a3938] transition-colors">
                        <span>Generate</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Category Buttons */}
              <div className="w-full flex flex-wrap items-center justify-center gap-3">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.label;
                  return (
                    <button
                      key={mode.label}
                      onClick={() => setActiveMode(mode.label)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border transition-colors ${
                        isActive 
                          ? "bg-black border-black text-white" 
                          : "bg-white border-[#e7e6e2] text-[#4f4e4a] hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium font-['TT_Interphases_Pro',sans-serif]">
                        {mode.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Hackathon Banner */}
        <section className="px-6 py-4">
          <div className="mx-auto max-w-[1254px]">
            <div className="relative overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl h-[380px]">
              {/* Background gradient lines */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute inset-0 opacity-70" style={{background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))'}} />
              </div>

              {/* Horizontal gradient lines */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute h-[2px] w-full top-[75px] opacity-30" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute h-[2px] w-full top-[133px] opacity-35" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute h-[4px] w-full top-[200px] opacity-45" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute h-[4px] w-full top-[258px] opacity-60" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute h-[4px] w-full top-[311px] opacity-50" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
              </div>

              {/* Vertical gradient line */}
              <div className="absolute w-px h-full left-[695px] opacity-15" style={{background: 'linear-gradient(180deg, transparent, #2b7fff 50%, transparent)'}} />

              {/* Glow effect */}
              <div className="absolute top-[-80px] left-[740px] w-[384px] h-[384px] rounded-full blur-[100px]" style={{background: 'radial-gradient(circle, rgba(43,127,255,0.3), transparent)'}} />

              {/* Content */}
              <div className="absolute inset-0 p-12 flex flex-col justify-between">
                <div className="space-y-4 max-w-[672px]">
                  <h2 className="text-white text-[56px] font-semibold leading-[56px] tracking-[-1.12px] font-['TT_Interphases_Pro',sans-serif]">
                    Novita Arena Battle
                  </h2>
                  <h3 className="text-transparent bg-clip-text text-[32px] font-semibold leading-10 tracking-[-0.64px] font-['TT_Interphases_Pro',sans-serif]" style={{backgroundImage: 'linear-gradient(90deg, #05df72 0%, #5ee9b5 100%)'}}>
                    Build it. Compare it. Make it glow.
                  </h3>
                  <p className="text-[#9e9c98] text-lg font-normal leading-6 font-['TT_Interphases_Pro',sans-serif] max-w-[589px]">
                    A 14-day fully remote battle. Arena battle focused on visual comparison, vibes, and shareability — not machines but artistic vibes.
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex items-start gap-8">
                    {/* Prize Pool */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#fdc700]" />
                        <span className="text-[#fdc700] text-sm font-normal leading-5 font-['TT_Interphases_Pro',sans-serif]">
                          PRIZE POOL
                        </span>
                      </div>
                      <p className="text-white/90 text-2xl font-semibold leading-[38px] font-['TT_Interphases_Pro',sans-serif]">
                        5,000 Credits
                      </p>
                    </div>

                    <div className="w-px h-12 bg-white/10" />

                    {/* Time Left */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#00d3f2]" />
                        <span className="text-[#00d3f2] text-sm font-normal leading-5 font-['TT_Interphases_Pro',sans-serif]">
                          TIME LEFT
                        </span>
                      </div>
                      <p className="text-white/90 text-2xl font-semibold leading-[38px] font-['TT_Interphases_Pro',sans-serif]">
                        10 days left
                      </p>
                    </div>

                    <div className="w-px h-12 bg-white/10" />

                    {/* Participants */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-[#c27aff]" />
                        <span className="text-[#c27aff] text-sm font-normal leading-5 font-['TT_Interphases_Pro',sans-serif]">
                          PARTICIPANTS
                        </span>
                      </div>
                      <p className="text-white/90 text-2xl font-semibold leading-[38px] font-['TT_Interphases_Pro',sans-serif]">
                        1,234
                      </p>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white rounded-full text-black text-lg font-bold font-['Inter',sans-serif] hover:bg-white/90 transition-all shadow-[0px_0px_20px_0px_rgba(255,255,255,0.3)]"
                  >
                    <span>Join Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="bg-muted/30 pb-20 pt-16">
          <div className="mx-auto max-w-7xl px-6">
            {/* Gallery Header */}
            <div className="mb-12">
              <h2 className="text-[#292827] text-[48px] font-semibold leading-[48px] font-['TT_Interphases_Pro',sans-serif]">
                Arena Gallery
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {mockApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Button variant="outline" size="lg" className="gap-2">
                Load more apps
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-[#101828] text-[48px] font-semibold leading-[48px] tracking-[-0.96px] font-['TT_Interphases_Pro',sans-serif] text-center mb-12">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-2">
              <AccordionItem value="item-0" className="bg-[#f9fafb] rounded-[10px] border-none px-6">
                <AccordionTrigger className="text-[#23d57c] text-xl font-semibold leading-6 tracking-[-0.4px] font-['TT_Interphases_Pro',sans-serif] hover:no-underline py-6">
                  How does the Novita affiliate program work?
                </AccordionTrigger>
                <AccordionContent className="text-[#4f4e4a] text-base leading-6 font-['TT_Interphases_Pro',sans-serif] pt-0 pb-6 border-t border-[#f3f4f6]">
                  The Novita affiliate program allows you to earn commissions by referring new customers to our platform. Once you sign up, you'll receive a unique tracking link. Share this link on your website, blog, or social media channels. When someone clicks your link and makes a purchase, you earn a percentage of the sale.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-1" className="bg-[#f9fafb] rounded-[10px] border-none px-6">
                <AccordionTrigger className="text-[#1e2939] text-xl font-semibold leading-6 tracking-[-0.4px] font-['TT_Interphases_Pro',sans-serif] hover:no-underline py-6">
                  Do I need a website or blog to be part of the Novita affiliate program?
                </AccordionTrigger>
                <AccordionContent className="text-[#4f4e4a] text-base leading-6 font-['TT_Interphases_Pro',sans-serif] pt-0 pb-6 border-t border-[#f3f4f6]">
                  No, you don't need a website or blog to participate. You can share your affiliate link through social media, email newsletters, or any other platform where you have an audience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-[#f9fafb] rounded-[10px] border-none px-6">
                <AccordionTrigger className="text-[#1e2939] text-xl font-semibold leading-6 tracking-[-0.4px] font-['TT_Interphases_Pro',sans-serif] hover:no-underline py-6">
                  If a customer clicks my link but buys later without the link, do I still get commission?
                </AccordionTrigger>
                <AccordionContent className="text-[#4f4e4a] text-base leading-6 font-['TT_Interphases_Pro',sans-serif] pt-0 pb-6 border-t border-[#f3f4f6]">
                  Yes, our tracking system uses cookies that typically last 30 days. If a customer clicks your link and makes a purchase within that timeframe, you'll receive credit for the referral.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-[#f9fafb] rounded-[10px] border-none px-6">
                <AccordionTrigger className="text-[#1e2939] text-xl font-semibold leading-6 tracking-[-0.4px] font-['TT_Interphases_Pro',sans-serif] hover:no-underline py-6">
                  When do I receive my rewards?
                </AccordionTrigger>
                <AccordionContent className="text-[#4f4e4a] text-base leading-6 font-['TT_Interphases_Pro',sans-serif] pt-0 pb-6 border-t border-[#f3f4f6]">
                  Rewards are typically processed monthly. Once you reach the minimum payout threshold, your earnings will be transferred to your designated payment method.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-[#f9fafb] rounded-[10px] border-none px-6">
                <AccordionTrigger className="text-[#1e2939] text-xl font-semibold leading-6 tracking-[-0.4px] font-['TT_Interphases_Pro',sans-serif] hover:no-underline py-6">
                  Where can I find Affiliate Terms of Service?
                </AccordionTrigger>
                <AccordionContent className="text-[#4f4e4a] text-base leading-6 font-['TT_Interphases_Pro',sans-serif] pt-0 pb-6 border-t border-[#f3f4f6]">
                  You can find our Affiliate Terms of Service in your affiliate dashboard or on our website's legal section. Make sure to review them carefully before participating in the program.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-[#f9fafb] rounded-[10px] border-none px-6">
                <AccordionTrigger className="text-[#1e2939] text-xl font-semibold leading-6 tracking-[-0.4px] font-['TT_Interphases_Pro',sans-serif] hover:no-underline py-6">
                  Are there any restrictions on the affiliate program?
                </AccordionTrigger>
                <AccordionContent className="text-[#4f4e4a] text-base leading-6 font-['TT_Interphases_Pro',sans-serif] pt-0 pb-6 border-t border-[#f3f4f6]">
                  Yes, there are some restrictions including prohibited promotional methods and content guidelines. Please refer to our Affiliate Terms of Service for complete details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
      
      <ArenaBattleModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
