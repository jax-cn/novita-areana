import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="bg-white border-b border-[#e7e6e2] sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[6px]">
          <div className="flex items-center">
            <svg width="24" height="15" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.9999 0L0 14.8333H23.9998L11.9999 0Z" fill="#23D57C"/>
            </svg>
          </div>
          <span className="text-[#292827] font-sans font-semibold text-[16px] leading-[14.286px]">
            Novita
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link 
            href="/" 
            className="text-[#292827] font-mono text-[14px] leading-[16px] hover:text-[#23d57c] transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/hackathon" 
            className="text-[#292827] font-mono text-[14px] leading-[16px] hover:text-[#23d57c] transition-colors"
          >
            Hackathon
          </Link>
          <Link 
            href="/gallery" 
            className="text-[#292827] font-mono text-[14px] leading-[16px] hover:text-[#23d57c] transition-colors"
          >
            Gallery
          </Link>
          <Link 
            href="/terms" 
            className="text-[#292827] font-mono text-[14px] leading-[16px] hover:text-[#23d57c] transition-colors"
          >
            Terms
          </Link>
        </nav>

        {/* Log In Button */}
        <Button 
          variant="outline" 
          className="border-[#e7e6e2] text-[#292827] font-mono text-[14px] leading-[16px] hover:border-[#23d57c] hover:text-[#23d57c]"
        >
          Log In
        </Button>
      </div>
    </header>
  )
}
