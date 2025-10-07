"use client"

import { useEffect } from "react"

interface ProfileViewTrackerProps {
  userId: string
}

export function ProfileViewTracker({ userId }: ProfileViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch("/api/profile-views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        })
      } catch (error) {
        console.error("Failed to track profile view:", error)
      }
    }

    trackView()
  }, [userId])

  return null
}