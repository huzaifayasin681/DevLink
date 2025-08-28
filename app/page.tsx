import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Code2, Users, Zap, Star, Github, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { FadeIn } from "@/components/fade-in"
import { AnimatedCounter } from "@/components/animated-counter"
import { db } from "@/lib/db"
import { getInitials } from "@/lib/utils"

async function getFeaturedProfiles() {
  try {
    const users = await db.user.findMany({
      where: {
        AND: [
          { username: { not: null } },
          { name: { not: null } },
          { bio: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        skills: true,
        isAvailableForWork: true,
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    })
    return users
  } catch (error) {
    console.error('Error fetching featured profiles:', error)
    return []
  }
}

async function getStats() {
  try {
    const [userCount, projectCount, blogCount] = await Promise.all([
      db.user.count(),
      db.project.count(),
      db.blogPost.count({ where: { published: true } })
    ])
    return {
      users: userCount,
      projects: projectCount,
      blogs: blogCount
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      users: 0,
      projects: 0,
      blogs: 0
    }
  }
}

export default async function HomePage() {
  const [featuredProfiles, stats] = await Promise.all([
    getFeaturedProfiles(),
    getStats()
  ])

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <Badge variant="secondary" className="mb-4">
                ✨ New: Portfolio templates available
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Connect, Showcase, Inspire
              </h1>
              <p className="mt-6 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
                The ultimate platform for developers to build their professional presence, 
                showcase amazing projects, and connect with the global tech community.
              </p>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/login">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/explore">
                    Explore Developers
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <AnimatedCounter value={stats.users} suffix={stats.users === 1 ? " Developer" : "+ Developers"} />
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <AnimatedCounter value={stats.projects} suffix={stats.projects === 1 ? " Project" : "+ Projects"} />
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Always Free</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                🚀 Powerful Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Everything you need to showcase your work
              </h2>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
                Build a stunning developer profile in minutes with our powerful, 
                feature-rich platform designed for modern developers
              </p>
            </div>
          </FadeIn>

          <div className="mx-auto mt-20 max-w-6xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FadeIn delay={200}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Code2 className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      Project Showcase
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Display your best work with rich project pages, live demos, 
                      interactive previews, and direct source code links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Rich media support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Live demo integration</span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={400}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      Professional Profile
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Create a stunning developer profile with skills showcase, 
                      experience timeline, and comprehensive social links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Custom domains</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>SEO optimized</span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={600}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                      Blog & Articles
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Share your knowledge with the community through our 
                      built-in blogging platform with markdown support
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Markdown editor</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Syntax highlighting</span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="mx-auto mt-12 max-w-6xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FadeIn delay={800}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2">
                  <CardHeader className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Star className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                      Analytics & Insights
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Track profile views, project engagement, and audience 
                      insights with detailed analytics dashboard
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeIn>

              <FadeIn delay={1000}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-pink-50/50 to-pink-100/30 dark:from-pink-950/20 dark:to-pink-900/10 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 hover:-translate-y-2">
                  <CardHeader className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Github className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
                      GitHub Integration
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Seamlessly sync your repositories, contributions, and 
                      coding activity directly from GitHub
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeIn>

              <FadeIn delay={1200}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-cyan-50/50 to-cyan-100/30 dark:from-cyan-950/20 dark:to-cyan-900/10 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-2">
                  <CardHeader className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <ExternalLink className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                      Easy Sharing
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Share your profile with QR codes, custom URLs, and 
                      social media integration for maximum reach
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Developer Profiles
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover amazing developers and get inspired by their work
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            {featuredProfiles.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featuredProfiles.map((profile) => (
                  <Card key={profile.id} className="card-hover">
                    <CardHeader className="text-center">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src={profile.image || ""} alt={profile.name || ""} />
                        <AvatarFallback>{getInitials(profile.name || "")}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <CardTitle>{profile.name}</CardTitle>
                        <CardDescription>@{profile.username}</CardDescription>
                      </div>
                      {profile.isAvailableForWork && (
                        <Badge variant="success" className="w-fit mx-auto">
                          Available for work
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {profile.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {profile._count.projects} projects
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/${profile.username}`}>
                          View Profile
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">No featured profiles yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to create your developer profile and get featured!
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/login">
                      Create Your Profile
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link href="/explore">
                View All Developers <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to showcase your work?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of developers who are building their professional presence with DevLink.
              It's free and takes less than 5 minutes to get started.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">
                  Create Your Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10" asChild>
                <Link href="/explore">
                  Explore Examples
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}