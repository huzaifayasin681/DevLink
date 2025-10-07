"use client"

import { useState, useEffect } from "react"
import { Eye, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"

interface ProfileView {
  id: string
  createdAt: string
  viewer?: {
    id: string
    name: string
    username: string
    image?: string
  }
  ipAddress?: string
}

interface RecentProfileViewsProps {
  onViewCountUpdate?: (count: number) => void
}

export function RecentProfileViews({ onViewCountUpdate }: RecentProfileViewsProps) {
  const [views, setViews] = useState<ProfileView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch("/api/profile-views/recent")
        if (response.ok) {
          const data = await response.json()
          setViews(data.views || [])
          if (onViewCountUpdate && data.totalViews) {
            onViewCountUpdate(data.totalViews)
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile views:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchViews()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Profile Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Recent Profile Views
        </CardTitle>
      </CardHeader>
      <CardContent>
        {views.length > 0 ? (
          <div className="space-y-3">
            {views.map((view) => (
              <div key={view.id} className="flex items-center gap-3">
                {view.viewer ? (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={view.viewer.image || ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(view.viewer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {view.viewer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{view.viewer.username} • {formatDate(view.createdAt)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Anonymous visitor</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(view.createdAt)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No profile views yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}