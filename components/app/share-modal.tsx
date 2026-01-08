'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Copy, Repeat, X, Edit } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  appName?: string;
  shareUrl?: string;
  previewImage?: string;
}

export function ShareModal({
  open = false,
  onOpenChange,
  appName = 'Project Alpha v1',
  shareUrl = 'app.ai/share/u/83js-29ks',
  previewImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuEUyhZ3KbhHzwPx4RHXay5LWvoNIQsyjsNB6BH0lL_uQI9U9uI35qhlr-KxVKV-RScG5g4dTON7wx0rZTx88VrOzBkHMbOSg9Z1NPQlN92Ooga-SLJVc1u7aoLp_FzfkAzLdCMkQY-qoVeXSmGyB5ABY5ze5YGZguir7BeHmzYpi9eCUnEcgE_yZlMtkrUVJaHK7uYPfALmreCeBPFJQFc0gvj6x7vlxHsMPKAk3tUPW7xcyXJTdWwiuWpdwmboahOjJSDA-df1E',
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-full h-auto p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col lg:flex-row h-auto lg:h-[680px]">
          {/* Left Side - Preview */}
          <div className="w-full lg:w-[60%] bg-muted/30 p-6 lg:p-10 flex flex-col justify-center items-center relative group">
            <div className="absolute top-6 left-6 bg-black/80 text-foreground text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              Preview
            </div>

            <div className="w-full h-full max-h-[480px] rounded-lg shadow-lg overflow-hidden relative bg-background">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{ backgroundImage: `url(${previewImage})` }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all cursor-pointer">
                <Button
                  size="icon"
                  className="flex items-center justify-center rounded-full w-20 h-20 bg-primary/90 text-foreground hover:scale-105 transition-transform shadow-xl backdrop-blur-sm"
                >
                  <svg
                    className="w-10 h-10 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                <div className="h-full w-1/3 bg-primary" />
              </div>
            </div>

            <p className="mt-6 text-muted-foreground text-sm font-medium flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Video loops automatically
            </p>
          </div>

          {/* Right Side - Controls */}
          <div className="w-full lg:w-[40%] bg-background p-8 lg:p-10 flex flex-col overflow-y-auto">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl lg:text-[40px] font-bold leading-[1.1]">
                Ready to Share
              </DialogTitle>
              <p className="text-muted-foreground text-lg font-normal leading-relaxed mt-2">
                Name your creation and share it with the world.
              </p>
            </DialogHeader>

            <div className="flex flex-col flex-1 gap-6">
              {/* App Name Input */}
              <div className="space-y-2">
                <Label htmlFor="app-name" className="text-sm font-bold uppercase tracking-wide">
                  App Naming
                </Label>
                <div className="relative">
                  <Input
                    id="app-name"
                    defaultValue={appName}
                    className="bg-muted/50 border-2 border-transparent focus:border-primary text-lg px-4 py-3.5 pr-10"
                  />
                  <Edit className="absolute right-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
                </div>
              </div>

              <Separator className="my-2" />

              {/* Social Sharing */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold leading-tight">
                  Share to Socials
                </h3>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 bg-muted/50 hover:bg-muted"
                  >
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-14 bg-muted/50 hover:bg-muted"
                  >
                    <svg
                      className="w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-14 bg-muted/50 hover:bg-muted"
                  >
                    <Repeat className="h-7 w-7" />
                  </Button>
                </div>
              </div>

              {/* Download & Copy Link */}
              <div className="mt-auto space-y-3 pt-6">
                <Button
                  size="lg"
                  className="w-full gap-3 shadow-sm hover:shadow-md"
                >
                  <Download className="h-6 w-6" />
                  Download Video (MP4)
                </Button>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-muted/50 border text-muted-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleCopy}
                    className="bg-foreground text-background hover:opacity-90 flex items-center gap-2"
                  >
                    <Copy className="h-5 w-5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 z-20 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 rounded-full"
        >
          <X className="h-6 w-6" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
