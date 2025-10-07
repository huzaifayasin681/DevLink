"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Code2, FileText, Users, Clock, CheckCircle, AlertCircle, PlusCircle, LayoutDashboard, User, DollarSign, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/main-layout"

export default function DeveloperDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [stats, setStats] = useState({ projects: 0, requests: 0, active: 0, completed: 0 })

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/developer/stats")
      const data = await res.json()
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSyncProfile = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/github/sync-profile", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast.success("Profile synced from GitHub!")
      } else {
        toast.error(data.error || "Failed to sync")
      }
    } catch (error) {
      toast.error("Error syncing profile")
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}! Manage your portfolio and client requests.
          </p>
        </div>

        {/* Tabs for Portfolio vs Client Work */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="clients">Client Work</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projects</CardTitle>
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.projects}</div>
                  <p className="text-xs text-muted-foreground">Portfolio projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Requests</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.requests}</div>
                  <p className="text-xs text-muted-foreground">Pending review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Work</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Actions</CardTitle>
                  <CardDescription>Manage your public profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/${session?.user?.username || 'profile'}`}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      View My Portfolio
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/dashboard/projects/new">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New Project
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/dashboard/blog/new">
                      <FileText className="h-4 w-4 mr-2" />
                      Write Blog Post
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/developer/import-repos">
                      <Code2 className="h-4 w-4 mr-2" />
                      Import GitHub Repos
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/dashboard/projects">
                      <Code2 className="h-4 w-4 mr-2" />
                      View All Projects
                    </Link>
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleSyncProfile}
                    disabled={syncing}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    {syncing ? "Syncing..." : "Sync GitHub Profile"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Work Actions</CardTitle>
                  <CardDescription>Manage service requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/developer/requests">
                      <Users className="h-4 w-4 mr-2" />
                      View All Requests
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/developer/requests">
                      <Clock className="h-4 w-4 mr-2" />
                      My Assignments
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/developer/requests">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Pending Reviews
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Management</CardTitle>
                <CardDescription>Showcase your work to the world</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Build Your Portfolio</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add projects, write blog posts, and showcase your skills
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link href="/dashboard/projects/new">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Project
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/profile">
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Work Tab */}
          <TabsContent value="clients" className="space-y-6">
            <ClientWorkTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function ClientWorkTab() {
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
      console.error("Error fetching requests:", error)
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

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  const pending = requests.filter(r => r.status === "pending")
  const active = requests.filter(r => r.status === "in_progress")
  const completed = requests.filter(r => r.status === "completed")

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>New client requests awaiting response</CardDescription>
            </div>
            <Badge variant="secondary">{pending.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending requests
            </div>
          ) : (
            <div className="space-y-4">
              {pending.slice(0, 3).map((request) => (
                <Card key={request.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{request.title}</h4>
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{request.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {request.client?.name}
                      </div>
                      <Button size="sm" onClick={() => handleAccept(request.id)}>
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pending.length > 3 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/developer/requests">View All {pending.length} Requests</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Work */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Active Work</CardTitle>
              <CardDescription>Requests you're currently working on</CardDescription>
            </div>
            <Badge className="bg-blue-600">{active.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active work
            </div>
          ) : (
            <div className="space-y-4">
              {active.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{request.title}</h4>
                      <Badge className="bg-blue-600">In Progress</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{request.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {request.client?.name}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recently Completed</CardTitle>
              <CardDescription>Your finished work</CardDescription>
            </div>
            <Badge className="bg-green-600">{completed.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No completed work yet
            </div>
          ) : (
            <div className="space-y-4">
              {completed.slice(0, 3).map((request) => (
                <Card key={request.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{request.title}</h4>
                      <Badge className="bg-green-600">Completed</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {request.client?.name}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/developer/requests">View All Client Requests</Link>
      </Button>
    </div>
  )
}
