import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Globe, Github, Twitter, Linkedin, Calendar, Briefcase, Mail, Zap, Code2, TrendingUp, Star, Eye, Users, FileText, Award, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { FadeIn } from "@/components/fade-in"
import { FollowButton } from "@/components/follow-button"
import { ProfileViewTracker } from "@/components/profile-view-tracker"
import { ReviewsSection } from "@/components/reviews-section"
import { EndorsementsSection } from "@/components/profile/endorsements-section"
import { TestimonialsSection } from "@/components/profile/testimonials-section"
import { ServicesSection } from "@/components/profile/services-section"
import { CollaborationRequests } from "@/components/collaboration/collaboration-requests"
import { db } from "@/lib/db"
import { getInitials, formatDate } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

async function getUserProfile(username: string, currentUserId?: string) {
  try {
    const user = await db.user.findUnique({
      where: { username },
      include: {
        projects: {
          where: { featured: true },
          orderBy: { createdAt: 'desc' },
          take: 6
        },
        assignedRequests: {
          where: { status: 'completed' },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            },
            project: true
          },
          orderBy: { updatedAt: 'desc' },
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
        endorsementsReceived: {
          include: {
            endorser: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        },
        testimonialsReceived: {
          where: { approved: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        services: {
          where: { active: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            projects: true,
            posts: { where: { published: true } },
            followers: true,
            following: true,
            reviews: true,
            assignedRequests: { where: { status: 'completed' } }
          }
        }
      }
    })

    if (!user) return null

    let isFollowing = false
    if (currentUserId && currentUserId !== user.id) {
      const follow = await db.follow.findFirst({
        where: {
          followerId: currentUserId,
          followingId: user.id
        }
      })
      isFollowing = !!follow
    }

    return { ...user, isFollowing }
  } catch (error) {
    console.error('Error fetching user profile for username:', username, error)
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
  const session = await getServerSession(authOptions)
  const user = await getUserProfile(params.username, session?.user?.id)

  if (!user) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-64 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>

        <div className="container relative -mt-32 pb-16">
          <FadeIn>
            {/* Profile Card */}
            <Card className="mb-8 border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="relative">
                      <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-slate-800 shadow-xl">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {getInitials(user.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      {user.isAvailableForWork && (
                        <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                          {user.name}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                          @{user.username}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{user.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatDate(user.createdAt).split(',')[1]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <FollowButton userId={user.id} initialFollowing={user.isFollowing} />
                        {session?.user?.id && session.user.id !== user.id && (
                          <CollaborationRequests
                            requests={[]}
                            currentUserId={session.user.id}
                            profileUserId={user.id}
                          />
                        )}
                        <Button variant="outline" asChild className="shadow-sm">
                          <Link href={`mailto:${user.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Contact
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {user.bio}
                        </p>
                      </div>
                    )}

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

          {/* Stats Grid */}
          <FadeIn delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                <CardContent className="p-6 text-center">
                  <Code2 className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{user._count.projects + user._count.assignedRequests}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Projects</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{user._count.posts}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Articles</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{user._count.followers}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Followers</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
                <CardContent className="p-6 text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{user.profileViews || 0}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Views</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-pink-600 dark:text-pink-400" />
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{user.skills.length}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Skills</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{user._count.reviews}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Reviews</div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills */}
              {user.skills.length > 0 && (
                <FadeIn delay={200}>
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-lg">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl">Skills & Expertise</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
                          <Badge
                            key={skill}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-shadow"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              {/* Projects */}
              {(user.projects.length > 0 || user.assignedRequests.length > 0) && (
                <FadeIn delay={300}>
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <Code2 className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-xl">Featured Work</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${user.username}/projects`}>
                            View All →
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {user.projects.map((project) => (
                          <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500">
                            <CardHeader>
                              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                {project.title}
                              </CardTitle>
                              <CardDescription className="line-clamp-2">
                                {project.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2 mb-4">
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
                                    <Link href={project.liveUrl} target="_blank">
                                      <Globe className="h-3 w-3 mr-2" />
                                      Demo
                                    </Link>
                                  </Button>
                                )}
                                {project.githubUrl && (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={project.githubUrl} target="_blank">
                                      <Github className="h-3 w-3 mr-2" />
                                      Code
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {user.assignedRequests.map((request) => (
                          <Card key={request.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-500">
                            <CardHeader>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-green-500 text-white">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              </div>
                              <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                                {request.title}
                              </CardTitle>
                              <CardDescription className="line-clamp-2">
                                {request.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline" className="text-xs">
                                  {request.category}
                                </Badge>
                                {request.client && (
                                  <Badge variant="outline" className="text-xs">
                                    Client: {request.client.name}
                                  </Badge>
                                )}
                              </div>
                              {request.project && (
                                <div className="flex gap-2">
                                  {request.project.liveUrl && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={request.project.liveUrl} target="_blank">
                                        <Globe className="h-3 w-3 mr-2" />
                                        Demo
                                      </Link>
                                    </Button>
                                  )}
                                  {request.project.githubUrl && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={request.project.githubUrl} target="_blank">
                                        <Github className="h-3 w-3 mr-2" />
                                        Code
                                      </Link>
                                    </Button>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              {/* Blog Posts */}
              {user.posts.length > 0 && (
                <FadeIn delay={400}>
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-600 rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-xl">Recent Articles</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${user.username}/blog`}>
                            View All →
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {user.posts.map((post) => (
                          <div key={post.id} className="group p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                              <Link href={`/${user.username}/blog/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>{formatDate(post.createdAt)}</span>
                              <span>•</span>
                              <span>{post.readingTime} min read</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              <FadeIn delay={500}>
                <ReviewsSection userId={user.id} username={user.username || ""} />
              </FadeIn>

              <FadeIn delay={600}>
                <EndorsementsSection
                  userId={user.id}
                  skills={user.skills}
                  endorsements={user.endorsementsReceived}
                  currentUserId={session?.user?.id}
                  isOwnProfile={session?.user?.id === user.id}
                />
              </FadeIn>

              {user.services.length > 0 && (
                <FadeIn delay={700}>
                  <ServicesSection
                    services={user.services}
                    hourlyRate={user.hourlyRate}
                    availableHours={user.availableHours}
                  />
                </FadeIn>
              )}

              <FadeIn delay={800}>
                <TestimonialsSection
                  userId={user.id}
                  testimonials={user.testimonialsReceived}
                  currentUserId={session?.user?.id}
                  isOwnProfile={session?.user?.id === user.id}
                />
              </FadeIn>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {user.projects.length === 0 && user.posts.length === 0 && (
                <FadeIn delay={600}>
                  <Card className="border-0 shadow-lg">
                    <CardContent className="text-center py-12">
                      <div className="space-y-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto">
                          <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {user.name} is just getting started on DevLink. Check back soon!
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
      </div>
      <ProfileViewTracker userId={user.id} />
    </MainLayout>
  )
}
