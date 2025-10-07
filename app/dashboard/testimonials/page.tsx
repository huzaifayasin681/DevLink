"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Quote } from "lucide-react"
import { approveTestimonial, rejectTestimonial } from "@/lib/actions"
import toast from "react-hot-toast"

interface Testimonial {
  id: string
  content: string
  relationship: string
  companyName: string | null
  position: string | null
  approved: boolean
  createdAt: string
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials")
      const data = await res.json()
      setTestimonials(data.testimonials || [])
    } catch (error) {
      toast.error("Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveTestimonial(id)
      toast.success("Testimonial approved!")
      fetchTestimonials()
    } catch (error) {
      toast.error("Failed to approve testimonial")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectTestimonial(id)
      toast.success("Testimonial rejected")
      fetchTestimonials()
    } catch (error) {
      toast.error("Failed to reject testimonial")
    }
  }

  const pending = testimonials.filter(t => !t.approved)
  const approved = testimonials.filter(t => t.approved)

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Testimonials</h1>
        <p className="text-muted-foreground">Manage testimonials from your clients and colleagues</p>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Approval
              <Badge variant="secondary">{pending.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.map((testimonial) => (
              <div key={testimonial.id} className="border rounded-lg p-4 space-y-4">
                <Quote className="h-6 w-6 text-muted-foreground" />
                <p className="italic">&ldquo;{testimonial.content}&rdquo;</p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.author.image || undefined} />
                      <AvatarFallback>{testimonial.author.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.author.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.position && `${testimonial.position}`}
                        {testimonial.position && testimonial.companyName && " at "}
                        {testimonial.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground">{testimonial.relationship}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(testimonial.id)}>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(testimonial.id)}>
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Approved Testimonials
            <Badge variant="secondary">{approved.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approved.length > 0 ? (
            <div className="space-y-4">
              {approved.map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-4 space-y-4">
                  <Quote className="h-6 w-6 text-muted-foreground" />
                  <p className="italic">&ldquo;{testimonial.content}&rdquo;</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.author.image || undefined} />
                        <AvatarFallback>{testimonial.author.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.author.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.position && `${testimonial.position}`}
                          {testimonial.position && testimonial.companyName && " at "}
                          {testimonial.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground">{testimonial.relationship}</p>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" onClick={() => handleReject(testimonial.id)}>
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No approved testimonials yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
