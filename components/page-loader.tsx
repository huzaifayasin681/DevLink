"use client"

import { useEffect } from "react"
import { useLoading } from "./loading-provider"

export function PageLoader() {
  const { stopLoading } = useLoading()

  useEffect(() => {
    // Hide loader when component mounts (page is loaded)
    stopLoading()
  }, [stopLoading])

  return null
}
