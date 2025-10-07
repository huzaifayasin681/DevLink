"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"

interface LikeButtonProps {
  projectId?: string
  postId?: string
  initialLiked?: boolean
  initialCount?: number
  size?: "sm" | "default" | "lg"
}

export function LikeButton({ 
  projectId, 
  postId, 
  initialLiked = false, 
  initialCount = 0,
  size = "default"
}: LikeButtonProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!session) {
      toast.error("Please sign in to like")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, postId })
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setCount(prev => data.liked ? prev + 1 : prev - 1)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Like error:", errorData)
        toast.error(errorData.error || "Failed to update like")
      }
    } catch (error) {
      console.error("Like request error:", error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleLike}
      disabled={loading}
      className="gap-2"
    >
      <Heart 
        className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} 
      />
      {count > 0 && <span>{count}</span>}
    </Button>
  )
}