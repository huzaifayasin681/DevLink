import React from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { 
  MapPin, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  Calendar,
  ExternalLink,
  Star,
  Clock,
  Grid3X3,
  Grid2X2,
  List
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"

interface ProfilePageProps {
  params: {
    username: string
  }
}

async function getProfile(username: string) {
  const { db } = await import("@/lib/db")
  
  const user = await db.user.findUnique({
    where: { username },
    include: {
      projects: {
        orderBy: { createdAt: "desc" }
      },
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" }
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
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const profile = await getProfile(params.username)
  
  if (!profile) {
    return {
      title: "Profile Not Found | DevLink"
    }
  }

  return {
    title: `${profile.name} (@${profile.username}) | DevLink`,
    description: profile.bio,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfile(params.username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.image || ""} alt={profile.name || ""} />
                <AvatarFallback className="text-4xl">{getInitials(profile.name || "")}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-xl text-muted-foreground mb-4">@{profile.username}</p>
                    {profile.bio && (
                      <p className="text-lg text-muted-foreground mb-4">{profile.bio}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDate(profile.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Social Links */}
                    <div className="flex gap-3">
                      {profile.website && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={profile.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                          </Link>
                        </Button>
                      )}
                      {profile.github && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={profile.github} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                          </Link>
                        </Button>
                      )}
                      {profile.twitter && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={profile.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </Link>
                        </Button>
                      )}
                      {profile.linkedin && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {profile.isAvailableForWork && (
                    <div>
                      <Badge variant="success" className="text-sm">
                        Available for work
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Featured Projects */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Projects</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {profile._count.projects} total
                  </span>

                </div>
              </div>
              
              {profile.projects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No featured projects yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {profile.projects.map((project) => (
                    <Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative">
                        {project.imageUrl ? (
                          <div className="aspect-video relative overflow-hidden">
                            <Image
                              src={project.imageUrl}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/20 transition-colors duration-300">
                            <div className="text-center">
                              <div className="h-12 w-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-2 transition-colors duration-300">
                                <Github className="h-6 w-6 text-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">{project.title}</p>
                            </div>
                          </div>
                        )}
                        {project.featured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-yellow-500 text-yellow-900 shadow-lg">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors duration-300">
                              <span className="truncate">{project.title}</span>
                              {project.featured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                              )}
                            </CardTitle>
                            <CardDescription className="line-clamp-3 mt-1">
                              {project.description}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {project.liveUrl && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10" asChild>
                                <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {project.githubUrl && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10" asChild>
                                <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs hover:bg-primary/10 transition-colors duration-200">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Posts */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Posts</h2>
                <span className="text-sm text-muted-foreground">
                  {profile._count.posts} published
                </span>
              </div>
              
              {profile.posts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No blog posts yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {profile.posts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/${profile.username}/blog/${post.slug}`}
                            className="hover:underline"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(post.createdAt)}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{post.readingTime} min read</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}