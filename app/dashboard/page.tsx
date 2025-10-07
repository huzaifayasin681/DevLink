import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { Plus, User, Code2, FileText, Eye, TrendingUp, Users, Heart, Mail, MessageSquare, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { DashboardClient } from "@/components/dashboard-client"
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
          profileViews: true,
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
      db.blogPost.count({ where: { userId } }),
      db.follow.count({ where: { followingId: userId } }),
      // Count likes on user's projects and posts
      db.like.count({
        where: {
          OR: [
            { project: { userId } },
            { post: { userId } }
          ]
        }
      }),
      // Count unread messages
      db.message.count({ where: { receiverId: userId, read: false } }),
      // Count pending testimonials
      db.testimonial.count({ where: { userId, approved: false } }),
      // Count pending collaboration requests
      db.collaborationRequest.count({ where: { receiverId: userId, status: 'pending' } })
    ])

    return {
      user,
      projects,
      blogPosts,
      stats: {
        projects: stats[0],
        publishedPosts: stats[1],
        totalPosts: stats[2],
        followers: stats[3],
        totalLikes: stats[4],
        unreadMessages: stats[5],
        pendingTestimonials: stats[6],
        pendingCollabRequests: stats[7]
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
        <DashboardClient 
          user={user}
          projects={projects}
          blogPosts={blogPosts}
          stats={stats}
          needsSetup={needsSetup}
        />
      </div>
    </MainLayout>
  )
}