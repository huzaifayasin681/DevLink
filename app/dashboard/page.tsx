import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { Plus, User, Code2, FileText, Eye, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { AnimatedCounter } from "@/components/animated-counter"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

async function getDashboardData(userId: string) {
  try {
    const [user, projects, blogPosts] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          bio: true,
          skills: true,
          isAvailableForWork: true,
          createdAt: true,
        }
      }),
      db.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          technologies: true,
          featured: true,
          createdAt: true,
        }
      }),
      db.blogPost.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          excerpt: true,
          published: true,
          createdAt: true,
        }
      })
    ])

    const stats = await Promise.all([
      db.project.count({ where: { userId } }),
      db.blogPost.count({ where: { userId, published: true } }),
      db.blogPost.count({ where: { userId } })
    ])

    return {
      user,
      projects,
      blogPosts,
      stats: {
        projects: stats[0],
        publishedPosts: stats[1],
        totalPosts: stats[2]
      }
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return {
      user: null,
      projects: [],
      blogPosts: [],
      stats: { projects: 0, publishedPosts: 0, totalPosts: 0 }
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { user, projects, blogPosts, stats } = await getDashboardData(session.user.id)

  if (!user) {
    redirect("/login")
  }

  const needsSetup = !user.username || !user.bio || user.skills.length === 0

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.name || user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user.username && (
                <Button variant="outline" asChild>
                  <Link href={`/${user.username}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/dashboard/profile">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Setup Alert */}
        {needsSetup && (
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="text-orange-800 dark:text-orange-200">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Your profile is incomplete. Add a username, bio, and skills to get discovered by other developers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/profile">
                  Complete Profile Setup
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats.projects} />
              </div>
              <p className="text-xs text-muted-foreground">
                Total projects created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={stats.publishedPosts} />
              </div>
              <p className="text-xs text-muted-foreground">
                Blog posts published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={0} />
              </div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Projects</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/projects">
                    View All
                  </Link>
                </Button>
              </div>
              <CardDescription>
                Your latest project work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-start justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {project.featured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No projects yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start showcasing your work by creating your first project.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/projects/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Blog Posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Blog Posts</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/blog">
                    View All
                  </Link>
                </Button>
              </div>
              <CardDescription>
                Your latest articles and thoughts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blogPosts.length > 0 ? (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-start justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No blog posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your knowledge and experiences with the community.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/blog/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Write Post
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to help you get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href="/dashboard/projects/new">
                  <Plus className="h-6 w-6" />
                  <span>New Project</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href="/dashboard/blog/new">
                  <FileText className="h-6 w-6" />
                  <span>Write Blog Post</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href="/dashboard/profile">
                  <User className="h-6 w-6" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}