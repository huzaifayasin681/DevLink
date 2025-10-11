"use client"

import React, { useState, useEffect, useRef } from 'react'

interface DevLinkLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function DevLinkLogo({ className = "", size = "md" }: DevLinkLogoProps) {
  const [isAssembled, setIsAssembled] = useState<boolean>(false)
  const [isTextVisible, setIsTextVisible] = useState<boolean>(false)
  const [isColored, setIsColored] = useState<boolean>(false)
  const [isPulsing, setIsPulsing] = useState<boolean>(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const sizes = {
    sm: { svg: 32, text: "text-2xl", container: "h-16" },
    md: { svg: 48, text: "text-5xl", container: "h-24" },
    lg: { svg: 64, text: "text-6xl", container: "h-32" }
  }

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])
  
  const playSound = (type: 'swoosh' | 'pop' | 'chime' | 'hover') => {
    const audioContext = audioContextRef.current
    if (!audioContext) return

    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    const now = audioContext.currentTime

    switch (type) {
      case 'swoosh':
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.15, now)
        oscillator.frequency.setValueAtTime(600, now)
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
        oscillator.start(now)
        oscillator.stop(now + 0.15)
        break
      case 'pop':
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.2, now)
        oscillator.frequency.setValueAtTime(400, now)
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.08)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
        oscillator.start(now)
        oscillator.stop(now + 0.08)
        break
      case 'chime':
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.18, now)
        oscillator.frequency.setValueAtTime(523.25, now)
        oscillator.frequency.exponentialRampToValueAtTime(783.99, now + 0.25)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
        oscillator.start(now)
        oscillator.stop(now + 0.35)
        break
      case 'hover':
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.08, now)
        oscillator.frequency.setValueAtTime(300, now)
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.06)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
        oscillator.start(now)
        oscillator.stop(now + 0.06)
        break
    }
  }

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsAssembled(true)
      playSound('swoosh')
    }, 50)
    const timer2 = setTimeout(() => {
      setIsTextVisible(true)
      playSound('pop')
    }, 400)
    const timer3 = setTimeout(() => {
      setIsColored(true)
      playSound('chime')
    }, 800)
    const timer4 = setTimeout(() => setIsPulsing(true), 1100)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  const springyEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

  return (
    <div 
      className={`relative flex items-center justify-center ${sizes[size].container} cursor-pointer group ${className}`}
      style={{ perspective: '800px' }}
      onMouseEnter={() => playSound('hover')}
    >
      <div className="flex items-center justify-center transition-all duration-700 ease-out group-hover:scale-110 group-hover:[transform:rotateY(10deg)]">
        {/* Left Bracket */}
        <svg
          width={sizes[size].svg}
          height={sizes[size].svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-all duration-500 ${isAssembled ? 'translate-x-0 rotate-0 opacity-100' : 'translate-x-[40px] rotate-[135deg] opacity-0'}`}
          style={{ transitionTimingFunction: springyEasing }}
        >
          <path
            d="M15 6L9 12L15 18"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-colors duration-500 ${isColored ? 'stroke-blue-500 dark:stroke-blue-400' : 'stroke-gray-600 dark:stroke-gray-400'}`}
          />
        </svg>

        {/* Text part */}
        <div
          className={`flex items-baseline font-bold ${sizes[size].text} tracking-tighter overflow-hidden mx-[-10px] ${
            isTextVisible ? 'animate-bounce-in' : 'opacity-0'
          }`}
        >
          <span className={`transition-colors duration-500 ${isColored ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Dev</span>
          <span
            className={`transition-colors duration-500 bg-clip-text text-transparent ${
              isColored ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400' : 'bg-gray-500 dark:bg-gray-400'
            }`}
          >
            link
          </span>
        </div>

        {/* Right Bracket */}
        <svg
          width={sizes[size].svg}
          height={sizes[size].svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-all duration-500 ${isAssembled ? 'translate-x-0 rotate-0 opacity-100' : 'translate-x-[-40px] -rotate-[135deg] opacity-0'}`}
          style={{ transitionTimingFunction: springyEasing }}
        >
          <path
            d="M9 18L15 12L9 6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-colors duration-500 ${isColored ? 'stroke-blue-500 dark:stroke-blue-400' : 'stroke-gray-600 dark:stroke-gray-400'}`}
          />
        </svg>
      </div>

      {/* Pulse/Glow Effect */}
      <div
        className={`absolute w-64 h-24 rounded-full transition-all duration-1000 ease-in-out
          ${isPulsing ? 'animate-pulse opacity-20 group-hover:opacity-30' : 'opacity-0 scale-50'}
          ${isColored ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-500 dark:bg-gray-400'}`}
        style={{ filter: 'blur(40px)' }}
      />
    </div>
  )
}