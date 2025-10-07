import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, Github, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { LikeButton } from "@/components/like-button"
import { CommentsSection } from "@/components/comments-section"
import { db } from "@/lib/db"
import { formatDate, getInitials } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ReactMarkdown from "react-markdown"

interface ProjectDetailPageProps {
  params: {
    username: string
    id: string
  }
}

async function getProject(id: string, currentUserId?: string) {
  try {
    const project = await db.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    if (!project) return null

    // Check if current user liked this project
    let isLiked = false
    if (currentUserId) {
      const like = await db.like.findFirst({
        where: {
          userId: currentUserId,
          projectId: id
        }
      })
      isLiked = !!like
    }

    return { ...project, isLiked }
  } catch (error) {
    return null
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await getServerSession(authOptions)
  const project = await getProject(params.id, session?.user?.id)

  if (!project || project.user.username !== params.username) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/${params.username}/projects`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <p className="text-muted-foreground">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LikeButton 
                      projectId={project.id}
                      initialLiked={(project as any).isLiked}
                      initialCount={project.likesCount}
                    />
                    {project.liveUrl && (
                      <Button asChild>
                        <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </Link>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button variant="outline" asChild>
                        <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          Code
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {project.imageUrl && (
                <div className="px-6">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{project.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardContent className="pt-6">
                <CommentsSection projectId={project.id} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Created by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={project.user.image || ""} />
                    <AvatarFallback>
                      {getInitials(project.user.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{project.user.username}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href={`/${project.user.username}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-sm">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="text-sm">{project.likesCount}</span>
                </div>
                {project.featured && (
                  <Badge variant="default" className="w-full justify-center">
                    Featured Project
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}