"use client"

import { DevLinkLogo } from "./devlink-logo"

interface LogoLoaderProps {
  message?: string
}

export function LogoLoader({ message = "Loading..." }: LogoLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-8 animate-scale-in">
        <DevLinkLogo size="lg" />
        {message && (
          <div className="text-center space-y-3 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            <p className="text-lg font-medium text-foreground">{message}</p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
