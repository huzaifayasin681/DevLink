import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { FadeIn } from "@/components/fade-in"
import { Code2, Users, Zap, Heart, Github, Twitter } from "lucide-react"

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <FadeIn>
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">About DevLink</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              DevLink is a platform built by developers, for developers. We believe every developer 
              deserves a beautiful space to showcase their work and connect with the global tech community.
            </p>
          </FadeIn>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <FadeIn delay={200}>
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Our Mission</CardTitle>
                <CardDescription className="text-lg">
                  Empowering developers to build their professional presence
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-center text-lg leading-relaxed">
                  We're on a mission to democratize developer portfolios. Whether you're a seasoned 
                  engineer at a Fortune 500 company or a student just starting your coding journey, 
                  DevLink provides the tools you need to showcase your skills, share your projects, 
                  and connect with opportunities.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground text-lg">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FadeIn delay={300}>
              <Card className="text-center h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Developer-First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Built by developers who understand the unique needs of the tech community. 
                    Every feature is designed with the developer experience in mind.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={400}>
              <Card className="text-center h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Community Driven</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We believe in the power of community. Our platform is shaped by feedback 
                    from developers around the world who use DevLink every day.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={500}>
              <Card className="text-center h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Always Free</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We believe great tools shouldn't be locked behind paywalls. DevLink's core 
                    features will always be free for developers worldwide.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose DevLink?</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to build your developer brand
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FadeIn delay={600}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Project Showcase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Display your projects with rich descriptions, live demos, and source code links. 
                    Support for all major programming languages and frameworks.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Live Demos</Badge>
                    <Badge variant="outline">GitHub Integration</Badge>
                    <Badge variant="outline">Tech Stack Tags</Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={700}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Professional Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create a stunning developer profile with custom URLs, skill showcases, 
                    and comprehensive social media integration.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Custom URLs</Badge>
                    <Badge variant="outline">SEO Optimized</Badge>
                    <Badge variant="outline">Social Links</Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={800}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Built-in Blog
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Share your knowledge with the community through our integrated blogging platform 
                    with markdown support and syntax highlighting.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Markdown Editor</Badge>
                    <Badge variant="outline">Syntax Highlighting</Badge>
                    <Badge variant="outline">Draft System</Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={900}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Developer Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with developers worldwide, discover new projects, and find 
                    collaboration opportunities in our growing community.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Global Network</Badge>
                    <Badge variant="outline">Skill Matching</Badge>
                    <Badge variant="outline">Job Opportunities</Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <FadeIn delay={1000}>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
              <CardContent className="py-12">
                <div className="grid gap-8 md:grid-cols-3 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                    <p className="text-muted-foreground">Developers</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">25,000+</div>
                    <p className="text-muted-foreground">Projects Showcased</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                    <p className="text-muted-foreground">Countries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with ❤️</h2>
            <p className="text-muted-foreground text-lg">
              DevLink is crafted by a passionate team of developers who believe in the power of community
            </p>
          </div>

          <FadeIn delay={1100}>
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="py-8">
                <p className="text-lg text-muted-foreground mb-6">
                  "We started DevLink because we believe every developer deserves a platform to shine. 
                  Whether you're building the next unicorn startup or contributing to open source, 
                  your work matters and deserves to be seen."
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://github.com" target="_blank">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://twitter.com" target="_blank">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <FadeIn delay={1200}>
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who are already building their professional presence with DevLink. 
                  It's free, fast, and designed just for you.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/login">
                      Get Started Free
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10" asChild>
                    <Link href="/explore">
                      Explore Profiles
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </section>
      </div>
    </MainLayout>
  )
}