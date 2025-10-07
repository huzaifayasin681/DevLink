"use client"

import { useEffect, useState, useCallback } from 'react'

export function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const updateScrollProgress = useCallback(() => {
    const currentProgress = window.scrollY
    const scrollHeight = document.body.scrollHeight - window.innerHeight

    if (scrollHeight) {
      const progress = Math.min((currentProgress / scrollHeight) * 100, 100)
      setScrollProgress(progress)
      setIsVisible(currentProgress > 100)
    }
  }, [])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollProgress()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateScrollProgress()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateScrollProgress])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform origin-left transition-all duration-300 ${
        isVisible ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
      }`}
      style={{
        transform: `scaleX(${scrollProgress / 100})`,
        transformOrigin: 'left'
      }}
    />
  )
}