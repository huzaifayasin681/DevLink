import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Globe, Github, Twitter, Linkedin, Calendar, Briefcase, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { FadeIn } from "@/components/fade-in"
import { db } from "@/lib/db"
import { getInitials, formatDate } from "@/lib/utils"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

async function getUserProfile(username: string) {
  try {
    const user = await db.user.findUnique({
      where: { username },
      include: {
        projects: {
          where: { featured: true },
          orderBy: { createdAt: 'desc' },
          take: 6
        },
        posts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            createdAt: true,
            readingTime: true
          }
        },
        _count: {
          select: {
            projects: true,
            posts: { where: { published: true } }
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const user = await getUserProfile(params.username)
  
  if (!user) {
    return {
      title: 'User Not Found | DevLink'
    }
  }

  return {
    title: `${user.name} (@${user.username}) | DevLink`,
    description: user.bio || `Check out ${user.name}'s developer profile on DevLink`,
    openGraph: {
      title: `${user.name} (@${user.username})`,
      description: user.bio || `Check out ${user.name}'s developer profile on DevLink`,
      images: user.image ? [user.image] : [],
    },
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const user = await getUserProfile(params.username)

  if (!user) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Profile Header */}
        <FadeIn>
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.name || "")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                      <p className="text-muted-foreground text-lg mb-2">@{user.username}</p>
                      {user.isAvailableForWork && (
                        <Badge variant="success" className="mb-4">
                          <Briefcase className="h-3 w-3 mr-1" />
                          Available for work
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`mailto:${user.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Link>
                    </Button>
                  </div>

                  {user.bio && (
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(user.createdAt).split(',')[1]}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-2">
                    {user.website && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={user.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </Link>
                      </Button>
                    )}
                    {user.github && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={user.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Link>
                      </Button>
                    )}
                    {user.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={user.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Link>
                      </Button>
                    )}
                    {user.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={user.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills */}
            {user.skills.length > 0 && (
              <FadeIn delay={200}>
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Featured Projects */}
            {user.projects.length > 0 && (
              <FadeIn delay={300}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Featured Projects</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${user.username}/projects`}>
                          View All ({user._count.projects})
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {user.projects.map((project) => (
                        <Card key={project.id} className="card-hover">
                          <CardHeader>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {project.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1 mb-4">
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
                            <div className="flex gap-2">
                              {project.liveUrl && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-3 w-3 mr-1" />
                                    Live Demo
                                  </Link>
                                </Button>
                              )}
                              {project.githubUrl && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-3 w-3 mr-1" />
                                    Code
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Recent Blog Posts */}
            {user.posts.length > 0 && (
              <FadeIn delay={400}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Articles</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${user.username}/blog`}>
                          View All ({user._count.posts})
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.posts.map((post) => (
                        <div key={post.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                          <h3 className="font-medium mb-2">
                            <Link 
                              href={`/${user.username}/blog/${post.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>{post.readingTime} min read</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <FadeIn delay={500}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Projects</span>
                      <span className="font-medium">{user._count.projects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Articles</span>
                      <span className="font-medium">{user._count.posts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Skills</span>
                      <span className="font-medium">{user.skills.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Empty State for New Users */}
            {user.projects.length === 0 && user.posts.length === 0 && (
              <FadeIn delay={600}>
                <Card>
                  <CardContent className="text-center py-8">
                    <div className="space-y-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <Briefcase className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-2">Getting Started</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.name} is just getting started on DevLink. 
                          Check back soon for projects and articles!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}