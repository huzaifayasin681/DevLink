import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Code2, Heart, Zap, Globe, Shield, Star, ArrowRight, CheckCircle, Target, Eye } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">About DevLink</Badge>
            <h1 className="text-4xl font-bold mb-4">Built by developers, for developers</h1>
            <p className="text-xl text-muted-foreground">
              DevLink is the ultimate platform for developers to showcase their work, 
              connect with peers, and build their professional presence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To empower developers worldwide by providing a platform where they can 
                  showcase their skills, share knowledge, and connect with opportunities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To become the go-to platform for developer portfolios, fostering a 
                  global community of creators, innovators, and problem solvers.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Why We Built DevLink
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                As developers ourselves, we understand the challenges of showcasing technical work 
                in a way that's both professional and accessible. Traditional portfolios often 
                fall short of capturing the full scope of a developer's capabilities.
              </p>
              <p className="text-muted-foreground">
                DevLink bridges this gap by providing a comprehensive platform that combines 
                project showcases, technical blogging, and professional networking - all in one place.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Always Free</h3>
              <p className="text-sm text-muted-foreground">
                Core features remain free forever for all developers
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Code2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Developer-First</h3>
              <p className="text-sm text-muted-foreground">
                Built with developers' needs and workflows in mind
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                Shaped by feedback from our developer community
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                Your data is yours. We prioritize privacy and transparency
              </p>
            </div>
          </div>

          <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="py-12">
              <Star className="h-12 w-12 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Join Our Community?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of developers building amazing careers with DevLink.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/login">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10" asChild>
                  <Link href="/explore">
                    Explore Community
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}