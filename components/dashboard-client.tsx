"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, User, Code2, FileText, Eye, TrendingUp, Users, Heart, Settings, Calendar, Mail, MessageSquare, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/animated-counter"
import { RecentProfileViews } from "@/components/recent-profile-views"

interface DashboardClientProps {
  user: any
  projects: any[]
  blogPosts: any[]
  stats: any
  needsSetup: boolean
}

export function DashboardClient({ user, projects, blogPosts, stats, needsSetup }: DashboardClientProps) {
  const [profileViews, setProfileViews] = useState(user.profileViews || 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 -mx-8 px-8 py-8 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user.name || user.email}</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.username && (
              <Button
                variant="outline"
                asChild
                className="rounded-lg border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Link href={`/${user.username}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            )}
            <Button
              asChild
              className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg"
            >
              <Link href="/dashboard/profile">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Setup Alert */}
      {needsSetup && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/50">
                <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 space-y-1">
                <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  Your profile is incomplete. Add a username, bio, and skills to get discovered by other developers.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-lg">
              <Link href="/dashboard/profile">
                Complete Profile Setup
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Engagement Notifications */}
      {(stats.unreadMessages > 0 || stats.pendingTestimonials > 0 || stats.pendingCollabRequests > 0) && (
        <div className="grid gap-4 md:grid-cols-3">
          {stats.unreadMessages > 0 && (
            <Link href="/dashboard/messages">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                      <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                    </div>
                    <Mail className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {stats.pendingTestimonials > 0 && (
            <Link href="/dashboard/profile">
              <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Testimonials</p>
                      <p className="text-2xl font-bold">{stats.pendingTestimonials}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {stats.pendingCollabRequests > 0 && (
            <Link href="/dashboard/collaborations">
              <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Collaboration Requests</p>
                      <p className="text-2xl font-bold">{stats.pendingCollabRequests}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Projects</CardTitle>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
              <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={stats.projects} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Total projects created
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Published Posts</CardTitle>
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={stats.publishedPosts} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Blog posts published
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Profile Views</CardTitle>
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={profileViews} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Total profile views
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Followers</CardTitle>
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={stats.followers} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              People following you
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Likes</CardTitle>
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={stats.totalLikes} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Likes on your content
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Projects */}
        <Card className="shadow-lg border-0 bg-white dark:bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-600 p-3 shadow-md">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Projects</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Your latest project work
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-lg border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <Link href="/dashboard/projects">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project: any, index: number) => (
                  <div
                    key={project.id}
                    className="rounded-lg border-l-4 border-l-blue-500 bg-slate-50 dark:bg-slate-800/50 p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                            {project.title}
                          </h4>
                          {project.featured && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 3).map((tech: string) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="rounded-full bg-muted p-3 w-fit mx-auto mb-4">
                  <Code2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start showcasing your work by creating your first project.
                </p>
                <Button asChild className="rounded-lg">
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
        <Card className="shadow-lg border-0 bg-white dark:bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-600 p-3 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Blog Posts</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Your latest articles and thoughts
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-lg border-2 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
              >
                <Link href="/dashboard/blog">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {blogPosts.length > 0 ? (
              <div className="space-y-4">
                {blogPosts.map((post: any) => (
                  <div
                    key={post.id}
                    className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {post.title}
                          </h4>
                          <Badge
                            variant={post.published ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="rounded-full bg-muted p-3 w-fit mx-auto mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No blog posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your knowledge and experiences with the community.
                </p>
                <Button asChild className="rounded-lg">
                  <Link href="/dashboard/blog/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Post
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Profile Views */}
        <RecentProfileViews onViewCountUpdate={setProfileViews} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to help you get started
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 rounded-lg"
              asChild
            >
              <Link href="/dashboard/projects/new">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">New Project</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 rounded-lg"
              asChild
            >
              <Link href="/dashboard/blog/new">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">Write Blog Post</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 rounded-lg"
              asChild
            >
              <Link href="/dashboard/profile">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Edit Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}