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
import { HomeToast } from "@/components/home-toast"
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
      <HomeToast />
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <Badge variant="secondary" className="mb-4 animate-bounce-in glass-card border-0 hover-glow">
                ✨ New: Portfolio templates available
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl animate-slide-up-fade">
                <span className="bg-gradient-mesh bg-clip-text text-transparent animate-shimmer">
                  Connect, Showcase, Inspire
                </span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                The ultimate platform for developers to build their professional presence,
                showcase amazing projects, and connect with the global tech community.
              </p>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-blue-500/25 animate-pulse-glow hover-glow group"
                >
                  <Link href="/login">
                    <span className="relative z-10">Get Started Free</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="glass-card border-0 hover:scale-105 transition-all duration-300 rounded-2xl hover:shadow-lg hover-lift group"
                >
                  <Link href="/explore">
                    <span className="relative z-10">Explore Developers</span>
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="mt-16 flex items-center justify-center gap-12 text-sm flex-wrap">
                <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-2xl hover-lift">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <AnimatedCounter value={stats.users} suffix={stats.users === 1 ? " Developer" : "+ Developers"} className="font-bold text-foreground" />
                    <div className="text-xs text-muted-foreground">Active Developers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-2xl hover-lift" style={{ animationDelay: '100ms' }}>
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                    <Code2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <AnimatedCounter value={stats.projects} suffix={stats.projects === 1 ? " Project" : "+ Projects"} className="font-bold text-foreground" />
                    <div className="text-xs text-muted-foreground">Showcased Projects</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-2xl hover-lift" style={{ animationDelay: '200ms' }}>
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl animate-pulse">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-foreground">Always Free</span>
                    <div className="text-xs text-muted-foreground">No Hidden Costs</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Enhanced background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
        </div>

        <div className="container relative">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6 glass-card border-0 hover-glow animate-bounce-in">
                🚀 Powerful Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl animate-slide-up-fade">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Everything you need to showcase your work
                </span>
              </h2>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Build a stunning developer profile in minutes with our powerful,
                feature-rich platform designed for modern developers
              </p>
            </div>
          </FadeIn>

          <div className="mx-auto mt-20 max-w-6xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FadeIn delay={200}>
                <Card className="group card-3d glass-card border-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  <CardHeader className="relative p-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-blue-500/25 animate-float">
                      <Code2 className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-3">
                      Project Showcase
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      Display your best work with rich project pages, live demos,
                      interactive previews, and direct source code links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Rich media support</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Live demo integration</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={400}>
                <Card className="group card-3d glass-card border-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  <CardHeader className="relative p-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-purple-500/25 animate-float" style={{ animationDelay: '-1s' }}>
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mb-3">
                      Professional Profile
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      Create a stunning developer profile with skills showcase,
                      experience timeline, and comprehensive social links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Custom domains</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">SEO optimized</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={600}>
                <Card className="group card-3d glass-card border-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  <CardHeader className="relative p-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-green-500/25 animate-float" style={{ animationDelay: '-2s' }}>
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 mb-3">
                      Blog & Articles
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      Share your knowledge with the community through our
                      built-in blogging platform with markdown support
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative p-8 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Markdown editor</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">Syntax highlighting</span>
                      </div>
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
                {featuredProfiles.map((profile, index) => (
                  <FadeIn key={profile.id} delay={200 + index * 100}>
                    <Card className="group card-3d glass-card border-0 hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                      <CardHeader className="text-center p-8 relative">
                        <div className="relative mx-auto mb-6">
                          <Avatar className="h-24 w-24 mx-auto ring-4 ring-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:ring-blue-500/40 transition-all duration-300 group-hover:scale-105">
                            <AvatarImage src={profile.image || ""} alt={profile.name || ""} />
                            <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {getInitials(profile.name || "")}
                            </AvatarFallback>
                          </Avatar>
                          {profile.isAvailableForWork && (
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-background animate-pulse" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {profile.name}
                          </CardTitle>
                          <CardDescription className="font-medium">@{profile.username}</CardDescription>
                        </div>
                        {profile.isAvailableForWork && (
                          <Badge className="w-fit mx-auto bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 animate-pulse">
                            Available for work
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="text-center p-8 pt-0">
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                          {profile.bio}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                          {profile.skills.slice(0, 3).map((skill, skillIndex) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-xs hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300"
                              style={{ animationDelay: `${skillIndex * 100}ms` }}
                            >
                              {skill}
                            </Badge>
                          ))}
                          {profile.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-muted">
                              +{profile.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                          <span className="font-medium">{profile._count.projects} projects</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-8 pt-0">
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 rounded-xl hover:scale-105"
                          asChild
                        >
                          <Link href={`/${profile.username}`}>
                            View Profile
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </FadeIn>
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
      <section className="relative py-32 overflow-hidden">
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-morphing-bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Particle background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6 animate-slide-up-fade">
                <span className="block">Ready to showcase</span>
                <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-shimmer">
                  your work?
                </span>
              </h2>
              <p className="text-xl text-blue-50 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Join thousands of developers who are building their professional presence with DevLink.
                It's free and takes less than 5 minutes to get started.
              </p>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="bg-white/90 text-gray-900 hover:bg-white hover:scale-105 transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-white/25 animate-bounce-in hover-glow group text-lg px-8 py-4"
                >
                  <Link href="/login">
                    <span className="relative z-10 font-semibold">Create Your Profile</span>
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-white border-white/30 hover:bg-white/10 hover:scale-105 transition-all duration-300 rounded-2xl backdrop-blur hover:shadow-lg glass-card border-2 text-lg px-8 py-4"
                >
                  <Link href="/explore">
                    <span className="relative z-10 font-semibold">Explore Examples</span>
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={600}>
              <div className="mt-16 flex items-center justify-center gap-8 text-sm text-blue-100 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>✨ No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <span>🚀 Setup in minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
                  <span>💎 Always free</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}