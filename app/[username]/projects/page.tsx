import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, Github, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { FadeIn } from "@/components/fade-in"
import { LikeButton } from "@/components/like-button"
import { ProfileViewTracker } from "@/components/profile-view-tracker"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface UserProjectsPageProps {
  params: {
    username: string
  }
}

async function getUserProjects(username: string, currentUserId?: string) {
  try {
    const user = await db.user.findUnique({
      where: { username },
      include: {
        projects: {
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ]
        },
        assignedRequests: {
          where: { status: 'completed' },
          include: {
            client: {
              select: {
                name: true,
                username: true,
                image: true
              }
            },
            project: true
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    })

    if (!user) return null

    // Get like status for current user
    let projectsWithLikes = user.projects
    if (currentUserId) {
      const likes = await db.like.findMany({
        where: {
          userId: currentUserId,
          projectId: { in: user.projects.map(p => p.id) }
        }
      })
      const likedProjectIds = new Set(likes.map(l => l.projectId))
      
      projectsWithLikes = user.projects.map(project => ({
        ...project,
        isLiked: likedProjectIds.has(project.id)
      }))
    }

    return { ...user, projects: projectsWithLikes }
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: UserProjectsPageProps) {
  const user = await getUserProjects(params.username)
  
  if (!user) {
    return { title: 'User Not Found | DevLink' }
  }

  return {
    title: `${user.name}'s Projects | DevLink`,
    description: `Browse all projects by ${user.name} (@${user.username})`,
  }
}

export default async function UserProjectsPage({ params }: UserProjectsPageProps) {
  const session = await getServerSession(authOptions)
  const user = await getUserProjects(params.username, session?.user?.id)

  if (!user) {
    notFound()
  }

  const featuredProjects = user.projects.filter(project => project.featured)
  const regularProjects = user.projects.filter(project => !project.featured)

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/${user.username}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold">{user.name}'s Projects</h1>
            <p className="text-muted-foreground">
              {user.projects.length + user.assignedRequests.length} projects by @{user.username}
            </p>
          </div>
        </div>

        {user.projects.length === 0 && user.assignedRequests.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Github className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">No projects yet</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.name} hasn't shared any projects yet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {user.assignedRequests.length > 0 && (
              <FadeIn>
                <section>
                  <h2 className="text-xl font-semibold mb-4">Completed Client Projects</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {user.assignedRequests.map((request) => (
                      <CompletedRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}

            {featuredProjects.length > 0 && (
              <FadeIn delay={100}>
                <section>
                  <h2 className="text-xl font-semibold mb-4">Featured Projects</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {featuredProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}

            {regularProjects.length > 0 && (
              <FadeIn delay={200}>
                <section>
                  <h2 className="text-xl font-semibold mb-4">All Projects</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {regularProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}
          </div>
        )}
      </div>
      <ProfileViewTracker userId={user.id} />
    </MainLayout>
  )
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="card-hover overflow-hidden group">
      {project.imageUrl ? (
        <div className="aspect-video relative">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video relative bg-muted flex items-center justify-center">
          <Github className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="line-clamp-1">
          <Link 
            href={`/${project.user?.username || 'user'}/projects/${project.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {project.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 3).map((tech: string) => (
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
            <LikeButton 
              projectId={project.id} 
              initialLiked={(project as any).isLiked}
              initialCount={project.likesCount}
              size="sm"
            />
          </div>
          
          <div className="flex gap-2">
            {project.liveUrl && (
              <Button size="sm" variant="outline" asChild>
                <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
            {project.githubUrl && (
              <Button size="sm" variant="outline" asChild>
                <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompletedRequestCard({ request }: { request: any }) {
  return (
    <Card className="card-hover overflow-hidden group border-l-4 border-l-green-500">
      {request.project?.imageUrl ? (
        <div className="aspect-video relative">
          <Image
            src={request.project.imageUrl}
            alt={request.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video relative bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
          <Github className="h-12 w-12 text-green-600" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-green-500 text-white">Completed</Badge>
        </div>
        <CardTitle className="line-clamp-1">{request.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {request.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {request.category}
          </Badge>
          {request.client && (
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/20">
              Client: {request.client.name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(request.updatedAt)}</span>
          </div>
          
          {request.project && (
            <div className="flex gap-2">
              {request.project.liveUrl && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={request.project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              )}
              {request.project.githubUrl && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={request.project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}