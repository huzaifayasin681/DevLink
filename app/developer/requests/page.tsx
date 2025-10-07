"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, CheckCircle, XCircle, User, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/main-layout"
import toast from "react-hot-toast"

export default function DeveloperRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/service-requests")
      const data = await res.json()
      setRequests(data)
    } catch (error) {
      toast.error("Failed to fetch requests")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" })
      })
      if (res.ok) {
        toast.success("Request accepted!")
        fetchRequests()
      }
    } catch (error) {
      toast.error("Failed to accept request")
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" })
      })
      if (res.ok) {
        toast.success("Request rejected")
        fetchRequests()
      }
    } catch (error) {
      toast.error("Failed to reject request")
    }
  }

  const handleComplete = async (requestId: string) => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" })
      })
      if (res.ok) {
        toast.success("Request marked as completed!")
        fetchRequests()
      }
    } catch (error) {
      toast.error("Failed to complete request")
    }
  }

  const pending = requests.filter(r => r.status === "pending")
  const myWork = requests.filter(r => r.status === "in_progress" && r.assignedTo)
  const completed = requests.filter(r => r.status === "completed")

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Service Requests</h1>
          <p className="text-muted-foreground">Manage and respond to client requests</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="mywork">My Work ({myWork.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              {pending.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending requests</p>
                  </CardContent>
                </Card>
              ) : (
                pending.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {request.client?.name} {request.client?.companyName && `(${request.client.companyName})`}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{request.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{request.description}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {request.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {request.budget}
                          </div>
                        )}
                        {request.timeline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {request.timeline}
                          </div>
                        )}
                        <Badge variant={request.priority === "high" ? "destructive" : "secondary"}>
                          {request.priority} priority
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleAccept(request.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button variant="outline" onClick={() => handleReject(request.id)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="mywork">
            <div className="space-y-4">
              {myWork.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active work</p>
                  </CardContent>
                </Card>
              ) : (
                myWork.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {request.client?.name}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-600">In Progress</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{request.description}</p>
                      <Button onClick={() => handleComplete(request.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {completed.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No completed requests yet</p>
                  </CardContent>
                </Card>
              ) : (
                completed.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {request.client?.name}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
