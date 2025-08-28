import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { FileQuestion, ArrowLeft, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[60vh] py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/explore">
                  <Search className="h-4 w-4 mr-2" />
                  Explore Developers
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="javascript:history.back()">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Error 404: The requested page could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}