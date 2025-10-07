"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  separator?: string
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className,
  prefix = "",
  suffix = "",
  separator = ","
}: AnimatedCounterProps) {
  // Ensure value is a valid number
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0
  const [count, setCount] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )

    const currentElement = countRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
      observer.disconnect()
    }
  }, [isInView])

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const startValue = count

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const currentCount = Math.floor(startValue + (safeValue - startValue) * easeOut)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, safeValue, duration, count])

  const formatNumber = (num: number): string => {
    if (separator === ",") {
      return num.toLocaleString()
    }
    return num.toString()
  }

  return (
    <span ref={countRef} className={cn("tabular-nums", className)}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}