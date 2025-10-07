import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Globe, Github, Twitter, Linkedin, Calendar, Briefcase, Mail, Zap, Code2, TrendingUp } from "lucide-react"
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
            reviews: true
          }
        }
      }
    })

    if (!user) return null

    // Check if current user is following this profile
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
      <div className="container py-8">
        {/* Profile Header */}
        <FadeIn>
          <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="relative mx-auto md:mx-0">
                  <Avatar className="h-40 w-40 ring-4 ring-slate-200 dark:ring-slate-600 shadow-2xl">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {getInitials(user.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  {user.isAvailableForWork && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 shadow-lg">
                      <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="space-y-4">
                      <div>
                        <h1 className="text-4xl font-bold mb-3 text-slate-900 dark:text-slate-100 tracking-tight">
                          {user.name}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xl mb-4 font-medium">
                          @{user.username}
                        </p>
                        {user.isAvailableForWork && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg px-4 py-2">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Available for work
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 flex-wrap justify-center md:justify-end">
                      <FollowButton
                        userId={user.id}
                        initialFollowing={user.isFollowing}
                      />
                      {session?.user?.id && session.user.id !== user.id && (
                        <CollaborationRequests
                          requests={[]}
                          currentUserId={session.user.id}
                          profileUserId={user.id}
                        />
                      )}
                      <Button
                        variant="outline"
                        asChild
                        className="rounded-lg border-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md transition-all"
                      >
                        <Link href={`mailto:${user.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Contact
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-6 border-l-4 border-l-blue-500 shadow-sm">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Joined {formatDate(user.createdAt).split(',')[1]}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-3">
                    {user.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-lg"
                      >
                        <Link href={user.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </Link>
                      </Button>
                    )}
                    {user.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-lg"
                      >
                        <Link href={user.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Link>
                      </Button>
                    )}
                    {user.twitter && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-lg"
                      >
                        <Link href={user.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Link>
                      </Button>
                    )}
                    {user.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-lg"
                      >
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
                <Card className="shadow-lg border-0 bg-white dark:bg-slate-900">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-purple-600 p-3 shadow-md">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Skills & Technologies
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-3">
                      {user.skills.map((skill, index) => (
                        <Badge
                          key={skill}
                          className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                        >
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
                <Card className="shadow-lg border-0 bg-white dark:bg-slate-900">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-600 p-3 shadow-md">
                          <Code2 className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          Featured Projects
                        </CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-lg border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                      >
                        <Link href={`/${user.username}/projects`}>
                          View All ({user._count.projects})
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {user.projects.map((project) => (
                        <Card
                          key={project.id}
                          className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                              {project.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                              {project.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.slice(0, 3).map((tech) => (
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
                            <div className="flex gap-3">
                              {project.liveUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="rounded-lg border-2 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                                >
                                  <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-3 w-3 mr-2" />
                                    Live Demo
                                  </Link>
                                </Button>
                              )}
                              {project.githubUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="rounded-lg border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-3 w-3 mr-2" />
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

            {/* Reviews Section */}
            <FadeIn delay={500}>
              <ReviewsSection userId={user.id} username={user.username || ""} />
            </FadeIn>

            {/* Endorsements Section */}
            <FadeIn delay={600}>
              <EndorsementsSection
                userId={user.id}
                skills={user.skills}
                endorsements={user.endorsementsReceived}
                currentUserId={session?.user?.id}
                isOwnProfile={session?.user?.id === user.id}
              />
            </FadeIn>

            {/* Services Section */}
            {user.services.length > 0 && (
              <FadeIn delay={700}>
                <ServicesSection
                  services={user.services}
                  hourlyRate={user.hourlyRate}
                  availableHours={user.availableHours}
                />
              </FadeIn>
            )}

            {/* Testimonials Section */}
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
            {/* Stats */}
            <FadeIn delay={500}>
              <Card className="shadow-lg border-0 bg-white dark:bg-slate-900">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-orange-600 p-3 shadow-md">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      Profile Stats
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Projects</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user._count.projects}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border-l-4 border-l-green-500">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Articles</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{user._count.posts}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border-l-4 border-l-purple-500">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Skills</span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user.skills.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-l-4 border-l-orange-500">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Followers</span>
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{user._count.followers}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border-l-4 border-l-cyan-500">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Following</span>
                      <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{user._count.following}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-l-yellow-500">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Profile Views</span>
                      <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{user.profileViews || 0}</span>
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
      <ProfileViewTracker userId={user.id} />
    </MainLayout>
  )
}