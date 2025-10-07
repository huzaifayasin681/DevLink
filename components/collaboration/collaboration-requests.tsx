"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Users, Check, X, Send } from "lucide-react"
import {
  sendCollaborationRequest,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
} from "@/lib/actions"
import toast from "react-hot-toast"

interface User {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface CollaborationRequest {
  id: string
  title: string
  description: string
  projectType: string
  budget: string | null
  timeline: string | null
  status: string
  sender: User
  receiver: User
  createdAt: Date
}

interface CollaborationRequestsProps {
  requests: CollaborationRequest[]
  currentUserId: string
  // For sending new requests from profile page
  profileUserId?: string
}

export function CollaborationRequests({
  requests,
  currentUserId,
  profileUserId,
}: CollaborationRequestsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectType: "",
    budget: "",
    timeline: "",
  })

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")

  const receivedRequests = requests.filter((r) => r.receiver.id === currentUserId)
  const sentRequests = requests.filter((r) => r.sender.id === currentUserId)

  const pendingReceived = receivedRequests.filter((r) => r.status === "pending")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profileUserId) {
      toast.error("No recipient specified")
      return
    }

    if (!formData.title || !formData.description || !formData.projectType) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      await sendCollaborationRequest({
        receiverId: profileUserId,
        title: formData.title,
        description: formData.description,
        projectType: formData.projectType,
        budget: formData.budget || undefined,
        timeline: formData.timeline || undefined,
      })
      toast.success("Collaboration request sent!")
      setFormData({ title: "", description: "", projectType: "", budget: "", timeline: "" })
      setIsOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send request")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      await acceptCollaborationRequest(requestId)
      toast.success("Request accepted!")
    } catch (error) {
      toast.error("Failed to accept request")
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await rejectCollaborationRequest(requestId)
      toast.success("Request rejected")
    } catch (error) {
      toast.error("Failed to reject request")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const RequestCard = ({ request, isReceived }: { request: CollaborationRequest; isReceived: boolean }) => {
    const otherUser = isReceived ? request.sender : request.receiver

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.image || undefined} />
                <AvatarFallback>
                  {otherUser.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <CardTitle className="text-lg">{request.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isReceived ? "From" : "To"} {otherUser.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{request.projectType}</Badge>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </div>

            {isReceived && request.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(request.id)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(request.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <CardDescription>{request.description}</CardDescription>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
            {request.budget && (
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-medium">{request.budget}</p>
              </div>
            )}
            {request.timeline && (
              <div>
                <p className="text-muted-foreground">Timeline</p>
                <p className="font-medium">{request.timeline}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    )
  }

  // If profileUserId is provided, show send button for that user's profile
  if (profileUserId && profileUserId !== currentUserId) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Collaborate
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Collaboration Request</DialogTitle>
            <DialogDescription>
              Propose a collaboration or project to this developer
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., E-commerce Platform Development"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type *</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open Source">Open Source</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the collaboration opportunity..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g., $5,000 - $10,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g., 2-3 months"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Dashboard view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Collaboration Requests</h2>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "received" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("received")}
          >
            Received
            {pendingReceived.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingReceived.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "sent" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("sent")}
          >
            Sent
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {activeTab === "received" ? (
          receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <RequestCard key={request.id} request={request} isReceived={true} />
            ))
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No collaboration requests received</p>
            </div>
          )
        ) : sentRequests.length > 0 ? (
          sentRequests.map((request) => (
            <RequestCard key={request.id} request={request} isReceived={false} />
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No collaboration requests sent</p>
          </div>
        )}
      </div>
    </div>
  )
}
