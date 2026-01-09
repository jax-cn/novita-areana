import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/app/app-card';
import { Bolt, Plus, TrendingUp, Clock, Beaker, Box } from 'lucide-react';
import { AppCard as AppCardType, ModelName } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const mockApps: AppCardType[] = [
  {
    id: '1',
    title: 'Gravity Data Sim',
    author: 'phys_wiz',
    model: 'Claude 3.5',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7alA6GSnzYKzv_iaaBMefKcuGt-BkmdeBPvOY92u9GY-TmgSU5wEb_P42t8BvLMnNxVJx-okzDsQsMjXxc09WcJ8ejLlUQOk2yNkF8h4v6fnhSpIssjEf4WtTUFM2MpEhSgXUfpiwH9Fjjqg-jb6K0ssOJ7vwYjJne-U--Sz3Vbd6rKGoz5gEpbsr1-AbjiQ-TsguOACGmJ1s4ZWzTyj4ADWizlpFjLRqpsX6jPszN2reOc53QZUGnC9MzuCQrr3ptjpMn8epE_Q',
    likes: 1200,
  },
  {
    id: '2',
    title: 'Snake 3D Remake',
    author: 'retro_dev',
    model: 'GPT-4o',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFRFUClCq6ybiXEKjq22HMXbWLz4q_L7gbZYs4SxYwIfzFWWZzJMvUD2YSPIWrNwmdCPqareipI9KHu79oNhUyKy3C5v6fVVToev9lceJHNFMTfwtkxmF3Jc-HIgBWfkwvdqJe9hz9D43JIAXX7XNdedPoseJ7andHLaf8IqFIJF1f0plJpbg5qwWJgcfToO-hRadiE7RzszYTN3O1-mHoUKPLyPesFlUWWYjT-RQdX9NvJ4FYQIcIdk1IXBd9Bp9Pf4S7Wk0hu_U',
    likes: 850,
  },
  {
    id: '3',
    title: 'Particle Controller',
    author: 'threejs_god',
    model: 'Claude 3.5',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnVMAVAfPY-z3xydBc4GuaP646hDi3d0JTEOxFh4-ZISxgrX6llG36-AbgsYvMAcVmhbmGPu9Ib2YmWNrnhIjyHaE47I6trYyJ1xk44D_rNQbSMISFwY7PQIixZpaQm3yCOVoTSrMpGz9fNxWFgG4CRvdywfL0CHUqGjSlYhgI4Z5Ptir0riDNgj7NA6ATgdvUqn-PeOsK6K17fbusw3Duq7cNHdEnVM6Ygca472YCz2ilhlw66GskDBlY-KGIDmBZTeZea-tQwdE',
    likes: 2100,
  },
  {
    id: '4',
    title: 'Cloth Physics Demo',
    author: 'sim_master',
    model: 'Llama 3',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg6VNqDZan7bxkNmvSno_pJ8p0TnF1grXxABXL15oRk9NOwgMdo8XfzjhW0r_m8DnbE35YCB-BD9NJz6fCInZO_OxnHjuzQOOSy9OlPA_ntO-sybaPiBoN4--WOGOsHdFxLkgqENco3GUHeJ9UzDbZqbggbEXfPGlWCjGgoK8C7ScTWMrLg6s3hv6DWlQm_trv-P87NW5EufWTgfxUq42ZETz2C9OSR_edIX9uS3f6zoF8fTI_w-_X5q7yIQBDYQOAEiTdQBGRV-Y',
    likes: 932,
  },
  {
    id: '5',
    title: 'Fluid Rain Sim',
    author: 'weather_ai',
    model: 'GPT-4o',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDilnTv7FHR-fvz6wlAd_WKWQAS5SD4MRnAQc9LdcYWGZa58a1laOPLNAN1vk2hS5NUhh0I-gaps1OyZa8PtqePVPsrC77fZH6v6IDwy0u5sz3OCOT92TmQEjz02MSJEQkWqshsPKJwaDnB5_f1hkpgz_P4Gi0bEj80qXVKzunBQNVsdbiVq32DZFIuujk9oz7xKjfcPz_YLWbe4TCAKRREy-8XxRaZk9jfNXFpgNycSfbZ6eiArosR6jonNsFkhmyEsZy9us9uPcc',
    likes: 4500,
  },
  {
    id: '6',
    title: 'Pong: Neon Edition',
    author: 'arcade_lover',
    model: 'Claude 3.5',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqGBqc3-YVTMgfmeXXMm0pYx7umPRuT7qhMosgCoIcST2TVDPSMj9utb4wMAKBjGe6VLGpb4Zf_obyAMMBZnz1GMiCxYQa2lF0ROOrde9p249X2LZKU_oxxfK0MVYD8DVGwcH9krPGaCppv4XIfN5lpUVm5Sc33xvUJRO8Ntn8oe0bKwNOG9RJd5OxGhlA5ExhFsJqxNH4gWkEoUkvygtsLr8_WYim4Ffe9FP_d3_ynSDocCxXazq85J43B5as87Z8fULoji_P6aI',
    likes: 156,
  },
];

const categories = [
  { name: 'Trending', icon: TrendingUp },
  { name: 'Newest', icon: Clock },
  { name: 'Physics', icon: Beaker },
  { name: '3D Scenes', icon: Box },
];

const models: ModelName[] = ['Claude 3.5', 'GPT-4o'];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center text-primary">
              <Bolt className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">
              Novita Arena
            </h2>
          </Link>
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted ring-2 ring-transparent transition-all hover:ring-primary cursor-pointer">
              {/* Mock Avatar Image */}
              <img 
                src="https://i.pravatar.cc/150?u=novita" 
                alt="User" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full px-6 py-16 md:py-24">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
            <h1 className="font-display max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-[80px]">
              Generate anything,{' '}
              <span className="relative inline-block text-primary">
                Share the magic
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 10"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    fill="transparent"
                    opacity="0.3"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="max-w-xl text-xl font-normal text-muted-foreground">
              Explore thousands of apps generated by the community. Fork, remix,
              and deploy in seconds.
            </p>

            {/* Search Bar */}
            <div className="mt-4 w-full max-w-3xl">
              <div className="group/input relative flex w-full items-center rounded-lg p-[3px] transition-all duration-300 hover:shadow-[0_0_25px_rgba(35,213,124,0.25)]">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-accent to-muted-foreground opacity-80 blur-[1px] transition-opacity group-hover/input:opacity-100" />
                <div className="relative flex h-16 w-full items-center rounded-md bg-background p-1.5 shadow-sm">
                  <div className="hidden sm:flex items-center gap-1.5 pl-2">
                    <Select defaultValue="DeepSeek">
                      <SelectTrigger className="h-auto rounded-md bg-muted/80 py-1.5 pl-3 pr-8 text-sm font-bold outline-none hover:bg-muted focus:ring-0 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DeepSeek">DeepSeek</SelectItem>
                        <SelectItem value="Claude 3.5">Claude 3.5</SelectItem>
                        <SelectItem value="GPT-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex flex-col items-center justify-center px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none">
                        vs
                      </span>
                    </div>

                    <Select defaultValue="GLM-4">
                      <SelectTrigger className="h-auto rounded-md bg-muted/80 py-1.5 pl-3 pr-8 text-sm font-bold outline-none hover:bg-muted focus:ring-0 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GLM-4">GLM-4</SelectItem>
                        <SelectItem value="Llama 3">Llama 3</SelectItem>
                        <SelectItem value="Mistral">Mistral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator orientation="vertical" className="hidden sm:block h-8 mx-3" />

                  <Input
                    placeholder="A physics simulation of falling sand..."
                    className="h-full border-none bg-transparent px-2 text-lg focus-visible:ring-0"
                  />

                  <div className="pl-2">
                    <Link href="/playground">
                      <Button
                        size="default"
                        className="gap-2 bg-foreground text-background hover:bg-accent hover:shadow-lg active:scale-95"
                      >
                        <Box className="h-5 w-5" />
                        <span className="hidden sm:inline">Run Comparison</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <Button
                variant="default"
                className="gap-2 shrink-0 shadow-sm"
                size="sm"
              >
                <TrendingUp className="h-4 w-4" />
                Trending
              </Button>

              {categories.slice(1).map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.name}
                    variant="outline"
                    className="gap-2 shrink-0 shadow-sm hover:border-primary hover:text-primary"
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}

              <Separator orientation="vertical" className="h-6 mx-2" />

              {models.map((model) => (
                <Button
                  key={model}
                  variant="outline"
                  className="gap-2 shrink-0 bg-accent/10 text-accent hover:bg-accent/20"
                  size="sm"
                >
                  {model}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="bg-muted/30 pb-20 pt-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Battles.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}
