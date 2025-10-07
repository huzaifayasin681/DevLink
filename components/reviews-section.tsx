"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Star, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LoginDialog } from "@/components/login-dialog"
import { getInitials } from "@/lib/utils"
import toast from "react-hot-toast"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewer: {
    id: string
    name: string
    username: string
    image: string | null
  }
}

interface ReviewsProps {
  userId: string
  username: string
}

export function ReviewsSection({ userId, username }: ReviewsProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [userId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWriteReview = () => {
    if (!session) {
      setLoginDialogOpen(true)
      return
    }
    setDialogOpen(true)
  }

  const submitReview = async () => {

    if (rating === 0 || !comment.trim()) {
      toast.error("Please provide both rating and comment")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, comment })
      })

      if (response.ok) {
        toast.success("Review submitted successfully!")
        setDialogOpen(false)
        setRating(0)
        setComment("")
        fetchReviews()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to submit review")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, readonly = false }: { value: number, onChange?: (rating: number) => void, readonly?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${readonly ? "" : "cursor-pointer"} ${
            star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reviews ({stats.totalReviews})
            </CardTitle>
            {stats.totalReviews > 0 && (
              <CardDescription className="flex items-center gap-2 mt-2">
                <StarRating value={Math.round(stats.averageRating)} readonly />
                <span>{stats.averageRating.toFixed(1)} average rating</span>
              </CardDescription>
            )}
          </div>
          
          {(!session || session.user.id !== userId) && (
            <>
              <Button size="sm" onClick={handleWriteReview}>
                Write Review
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Review @{username}</DialogTitle>
                  <DialogDescription>
                    Share your experience working with this developer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Rating</label>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comment</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Describe your experience..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={submitReview} disabled={submitting} className="w-full">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </DialogContent>
              </Dialog>
              <LoginDialog 
                open={loginDialogOpen} 
                onOpenChange={setLoginDialogOpen}
                title="Login to Write Review"
                description="Please login with Google or GitHub to write a review for this developer."
              />
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to review this developer!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer.image || ""} />
                    <AvatarFallback>{getInitials(review.reviewer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.reviewer.name}</span>
                      <Badge variant="outline">@{review.reviewer.username}</Badge>
                      <StarRating value={review.rating} readonly />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}