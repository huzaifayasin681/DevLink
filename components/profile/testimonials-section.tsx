"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageSquare, Quote } from "lucide-react"
import { addTestimonial } from "@/lib/actions"
import toast from "react-hot-toast"

interface Author {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface Testimonial {
  id: string
  content: string
  relationship: string
  companyName: string | null
  position: string | null
  approved: boolean
  author: Author
  createdAt: Date
}

interface TestimonialsSectionProps {
  userId: string
  testimonials: Testimonial[]
  currentUserId?: string
  isOwnProfile?: boolean
}

export function TestimonialsSection({
  userId,
  testimonials,
  currentUserId,
  isOwnProfile = false,
}: TestimonialsSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    content: "",
    relationship: "",
    companyName: "",
    position: "",
  })

  const approvedTestimonials = testimonials.filter((t) => t.approved)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUserId) {
      toast.error("Please log in to write a testimonial")
      return
    }

    if (!formData.content || !formData.relationship) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      await addTestimonial({
        userId,
        content: formData.content,
        relationship: formData.relationship,
        companyName: formData.companyName || undefined,
        position: formData.position || undefined,
      })
      toast.success("Testimonial submitted! Waiting for approval.")
      setFormData({ content: "", relationship: "", companyName: "", position: "" })
      setIsOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit testimonial")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Testimonials</h2>

        {!isOwnProfile && currentUserId && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Write Testimonial
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Write a Testimonial</DialogTitle>
                <DialogDescription>
                  Share your experience working with this developer
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) =>
                      setFormData({ ...formData, relationship: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Colleague">Colleague</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Partner">Partner</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="e.g., Acme Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Your Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="e.g., CEO, Product Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Testimonial *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Write your testimonial here..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Submitting..." : "Submit Testimonial"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {approvedTestimonials.length > 0 ? (
        <div className="grid gap-6">
          {approvedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="border rounded-lg p-6 space-y-4 bg-card"
            >
              <Quote className="h-8 w-8 text-muted-foreground" />

              <p className="text-lg italic">&ldquo;{testimonial.content}&rdquo;</p>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.author.image || undefined} />
                  <AvatarFallback>
                    {testimonial.author.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-semibold">{testimonial.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.position && `${testimonial.position}`}
                    {testimonial.position && testimonial.companyName && " at "}
                    {testimonial.companyName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {testimonial.relationship}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(testimonial.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No testimonials yet</p>
          {!isOwnProfile && currentUserId && (
            <p className="text-sm text-muted-foreground mt-2">
              Be the first to write a testimonial!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
