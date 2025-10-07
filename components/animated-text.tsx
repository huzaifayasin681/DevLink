"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedTextProps {
  text: string | string[]
  className?: string
  gradient?: boolean
  typewriter?: boolean
  glow?: boolean
  delay?: number
}

export function AnimatedText({
  text,
  className,
  gradient = false,
  typewriter = false,
  glow = false,
  delay = 0
}: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const textArray = Array.isArray(text) ? text : [text]
  const currentText = textArray[currentIndex % textArray.length]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!typewriter) {
      setDisplayText(currentText)
      return
    }

    let i = 0
    const timer = setInterval(() => {
      if (i <= currentText.length) {
        setDisplayText(currentText.slice(0, i))
        i++
      } else {
        clearInterval(timer)
        if (textArray.length > 1) {
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1)
            setDisplayText('')
          }, 2000)
        }
      }
    }, 100)

    return () => clearInterval(timer)
  }, [currentText, typewriter, textArray.length])

  const textClasses = cn(
    'transition-all duration-1000',
    {
      'opacity-0 translate-y-8': !isVisible,
      'opacity-100 translate-y-0': isVisible,
      'bg-gradient-mesh bg-clip-text text-transparent animate-shimmer': gradient,
      'animate-neon-flicker': glow,
    },
    className
  )

  return (
    <span className={textClasses}>
      {displayText}
      {typewriter && (
        <span className="animate-pulse ml-1 text-blue-500">|</span>
      )}
    </span>
  )
}

interface FloatingWordsProps {
  words: string[]
  className?: string
}

export function FloatingWords({ words, className }: FloatingWordsProps) {
  return (
    <div className={cn("relative", className)}>
      {words.map((word, index) => (
        <span
          key={word}
          className="inline-block animate-float"
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: `${3 + (index % 3)}s`
          }}
        >
          {word}
          {index < words.length - 1 && <span className="mr-2" />}
        </span>
      ))}
    </div>
  )
}

interface GlitchTextProps {
  text: string
  className?: string
}

export function GlitchText({ text, className }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={cn(
        "relative inline-block transition-all duration-200",
        {
          "animate-pulse transform skew-x-1 scale-105": isGlitching
        },
        className
      )}
    >
      {text}
      {isGlitching && (
        <>
          <span className="absolute inset-0 text-red-500 opacity-70 -translate-x-1 animate-ping">
            {text}
          </span>
          <span className="absolute inset-0 text-blue-500 opacity-70 translate-x-1 animate-ping">
            {text}
          </span>
        </>
      )}
    </span>
  )
}