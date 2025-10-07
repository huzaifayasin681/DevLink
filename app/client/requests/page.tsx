"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ServiceRequest {
  id: string
  title: string
  category: string
  status: string
  priority: string
  createdAt: string
  developer?: {
    name: string
    image: string
    username: string
  }
}

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/service-requests")
      const data = await res.json()
      setRequests(data)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "in_progress": return <AlertCircle className="h-4 w-4" />
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "rejected": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const filteredRequests = filter === "all" 
    ? requests 
    : requests.filter(r => r.status === filter)

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Service Requests</h1>
            <p className="text-muted-foreground">Track and manage your service requests</p>
          </div>
          <Button asChild>
            <Link href="/client/requests/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Request
            </Link>
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
            Pending
          </Button>
          <Button variant={filter === "in_progress" ? "default" : "outline"} size="sm" onClick={() => setFilter("in_progress")}>
            In Progress
          </Button>
          <Button variant={filter === "completed" ? "default" : "outline"} size="sm" onClick={() => setFilter("completed")}>
            Completed
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No requests found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filter === "all" ? "Create your first service request to get started" : `No ${filter} requests`}
              </p>
              <Button asChild>
                <Link href="/client/requests/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline">{request.category}</Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status.replace("_", " ")}</span>
                        </Badge>
                        {request.priority === "high" && (
                          <Badge variant="destructive">High Priority</Badge>
                        )}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/client/requests/${request.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Submitted {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    {request.developer && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Assigned to:</span>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={request.developer.image} />
                          <AvatarFallback>{request.developer.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{request.developer.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
