"use client"

import { useState } from "react"
import { UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
  size?: "sm" | "default" | "lg"
}

export function FollowButton({ 
  userId, 
  initialFollowing = false,
  size = "default"
}: FollowButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  if (!session || session.user.id === userId) {
    return null
  }

  const handleFollow = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId })
      })

      if (response.ok) {
        const data = await response.json()
        setFollowing(data.following)
        toast.success(data.following ? "Following!" : "Unfollowed")
        router.refresh()
      } else {
        toast.error("Failed to update follow status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      size={size}
      onClick={handleFollow}
      disabled={loading}
      className="gap-2"
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  )
}