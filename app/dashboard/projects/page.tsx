import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import Image from "next/image"
import { 
  Plus, 
  ExternalLink, 
  Github,
  Edit,
  Trash2,
  Star,
  Calendar,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { authOptions } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

async function getUserProjects(userId: string) {
  const { db } = await import("@/lib/db")
  
  return await db.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  })
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const projects = await getUserProjects(session.user.id)
  const featuredProjects = projects.filter(project => project.featured)
  const regularProjects = projects.filter(project => !project.featured)

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Projects</h1>
              <p className="text-muted-foreground">
                Manage your project portfolio ({projects.length} projects)
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">No projects yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Start building your portfolio by adding your first project. 
                    Showcase your skills and attract potential employers.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/projects/new">
                    Create Your First Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Featured Projects</h2>
                  <Badge variant="secondary">{featuredProjects.length}</Badge>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {featuredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {/* Regular Projects */}
            {regularProjects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">All Projects</h2>
                  <Badge variant="outline">{regularProjects.length}</Badge>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {regularProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

interface ProjectCardProps {
  project: any
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="card-hover overflow-hidden">
      {project.imageUrl ? (
        <div className="aspect-video relative">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
          />
          {project.featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="bg-yellow-500 text-yellow-900">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video relative bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Github className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{project.title}</p>
          </div>
          {project.featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="bg-yellow-500 text-yellow-900">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">{project.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          
          <div className="flex gap-1 ml-2">
            {project.liveUrl && (
              <Button size="icon" variant="ghost" asChild>
                <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {project.githubUrl && (
              <Button size="icon" variant="ghost" asChild>
                <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
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
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}