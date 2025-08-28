import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { 
  User, 
  Settings, 
  FolderOpen, 
  FileText, 
  BarChart3,
  Plus,
  Eye,
  ExternalLink,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { authOptions } from "@/lib/auth"
import { getInitials, formatDate } from "@/lib/utils"

async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

async function getUserData(userId: string) {
  const { db } = await import("@/lib/db")
  
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      projects: {
        orderBy: { createdAt: "desc" }
      },
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" }
      }
    }
  })
  
  if (!user) {
    throw new Error("User not found")
  }
  
  return {
    ...user,
    stats: {
      profileViews: Math.floor(Math.random() * 1000), // Mock analytics data
      projectViews: Math.floor(Math.random() * 5000),
      totalViews: Math.floor(Math.random() * 10000)
    }
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }

  const userData = await getUserData(user.id)
  const publishedPosts = userData.posts.filter(post => post.published)
  const draftPosts = userData.posts.filter(post => !post.published)
  const featuredProjects = userData.projects.filter(project => project.featured)

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your profile, projects, and content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${userData.username}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/profile">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.stats.profileViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.projects.length}</div>
              <p className="text-xs text-muted-foreground">
                {featuredProjects.length} featured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedPosts.length}</div>
              <p className="text-xs text-muted-foreground">
                {draftPosts.length} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your latest project work</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/dashboard/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {userData.projects.length > 0 ? (
                  <div className="space-y-4">
                    {userData.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{project.title}</h4>
                            {project.featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                          <div className="flex gap-1">
                            {project.technologies.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/projects/${project.id}`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/projects">
                        View All Projects ({userData.projects.length})
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No projects yet</p>
                    <Button className="mt-2" asChild>
                      <Link href="/dashboard/projects/new">
                        Create Your First Project
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Articles */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Articles</CardTitle>
                  <CardDescription>Your latest blog posts</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/dashboard/blog/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {userData.posts.length > 0 ? (
                  <div className="space-y-4">
                    {userData.posts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{post.title}</h4>
                            <Badge 
                              variant={post.published ? "success" : "secondary"} 
                              className="text-xs"
                            >
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>{post.readingTime} min read</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/blog/${post.id}`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/blog">
                        View All Articles ({userData.posts.length})
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No articles yet</p>
                    <Button className="mt-2" asChild>
                      <Link href="/dashboard/blog/new">
                        Write Your First Article
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Profile Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
                <CardDescription>How others see your profile</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={userData.image || ""} alt={userData.name || ""} />
                  <AvatarFallback className="text-lg">{getInitials(userData.name || "")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{userData.name}</h3>
                  <p className="text-sm text-muted-foreground">@{userData.username}</p>
                  {userData.isAvailableForWork && (
                    <Badge variant="success" className="mt-2">
                      Available for work
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{userData.bio}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${userData.username}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/blog/new">
                    <FileText className="h-4 w-4 mr-2" />
                    Write Article
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span>{formatDate(userData.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects</span>
                  <span>{userData.projects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Articles</span>
                  <span>{publishedPosts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skills</span>
                  <span>{userData.skills.length}</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  )
}