"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { PlusCircle, FileText, Clock, CheckCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 })
  const [recentRequests, setRecentRequests] = useState<any[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/service-requests")
      const data = await res.json()
      setRecentRequests(data.slice(0, 3))
      setStats({
        total: data.length,
        pending: data.filter((r: any) => r.status === "pending").length,
        inProgress: data.filter((r: any) => r.status === "in_progress").length,
        completed: data.filter((r: any) => r.status === "completed").length
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}! Manage your service requests and projects.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Finished</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Requests */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Service Requests</CardTitle>
              <CardDescription>Your latest service requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No requests yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first service request
                  </p>
                  <Button asChild>
                    <Link href="/client/requests/new">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Service Request
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{request.title}</h4>
                          <Badge className={
                            request.status === "pending" ? "bg-yellow-500" :
                            request.status === "in_progress" ? "bg-blue-500" :
                            request.status === "completed" ? "bg-green-500" : "bg-gray-500"
                          }>
                            {request.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{request.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/client/requests/${request.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/client/requests">View All Requests</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/client/requests/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Service Request
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/client/requests">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Requests
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/client/profile">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Ready to get started?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Submit a service request and our team of developers will review it within 24 hours.
                </p>
                <Button size="sm" asChild>
                  <Link href="/client/requests/new">
                    Create Your First Request
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
