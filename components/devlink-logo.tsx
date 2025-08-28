"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface DevLinkLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function DevLinkLogo({ className, size = "md", animated = true }: DevLinkLogoProps) {
  const [displayText, setDisplayText] = useState("DevLink")
  const [showCursor, setShowCursor] = useState(false)
  const [phase, setPhase] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const sizes = {
    sm: { container: "w-24 h-8", text: "text-base" },
    md: { container: "w-32 h-10", text: "text-xl" },
    lg: { container: "w-40 h-12", text: "text-2xl" }
  }

  const playSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audio.volume = 0.1
      audio.play().catch(() => {})
    } catch {}
  }

  useEffect(() => {
    if (!isHovered) {
      setDisplayText("DevLink")
      setShowCursor(false)
      setPhase(0)
      return
    }

    const text = "DevLink"
    let currentIndex = 0

    // Terminal flicker
    setTimeout(() => setPhase(1), 100)
    
    // Start typing after flicker
    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        if (currentIndex > 0) playSound()
        currentIndex++
      } else {
        clearInterval(typeInterval)
        setPhase(2)
        // Hide cursor after typing
        setTimeout(() => setShowCursor(false), 500)
      }
    }, 150)

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => {
      clearInterval(typeInterval)
      clearInterval(cursorInterval)
    }
  }, [isHovered])

  return (
    <div 
      className={cn("relative flex items-center justify-center cursor-pointer", sizes[size].container, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Terminal flicker */}
      {phase >= 1 && (
        <div className="absolute inset-0 bg-blue-400/20 animate-[flicker_0.3s_ease-out]" />
      )}

      {/* Typewriter text */}
      <div className={cn("relative font-mono font-bold tracking-tight", sizes[size].text)}>
        {displayText.split("").map((char, i) => (
          <span
            key={i}
            className={cn(
              "inline-block",
              i < 3 ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400",
              phase >= 2 && i >= 3 && "animate-pulse"
            )}
          >
            {char}
          </span>
        ))}
        {/* Cursor */}
        {showCursor && (
          <span className="inline-block w-0.5 h-full bg-blue-600 dark:bg-blue-400 ml-0.5 animate-pulse" />
        )}
      </div>

      {/* Glow effect */}
      {phase >= 2 && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-400/10 animate-pulse rounded-lg" />
      )}
    </div>
  )
}