import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { UserX, ArrowLeft, Search } from "lucide-react"

export default function ProfileNotFound() {
  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[60vh] py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <UserX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Profile Not Found</CardTitle>
            <CardDescription>
              The developer profile you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/explore">
                  <Search className="h-4 w-4 mr-2" />
                  Explore Developers
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Looking to create your own developer profile?{" "}
              <Link href="/login" className="underline hover:text-foreground">
                Get started here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}