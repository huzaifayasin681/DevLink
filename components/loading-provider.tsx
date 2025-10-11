"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { DevLinkLogo } from "./devlink-logo"

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider")
  }
  return context
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const startLoading = useCallback(() => {
    setIsVisible(true)
    setTimeout(() => setIsLoading(true), 10)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setTimeout(() => setIsVisible(false), 300)
  }, [])

  if (!isVisible) return <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>{children}</LoadingContext.Provider>

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ease-out ${
        isLoading ? 'bg-background/80 backdrop-blur-md opacity-100' : 'bg-background/0 backdrop-blur-none opacity-0'
      }`}>
        <div className={`flex flex-col items-center gap-6 transition-all duration-500 ease-out ${
          isLoading ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          <DevLinkLogo size="lg" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </LoadingContext.Provider>
  )
}
