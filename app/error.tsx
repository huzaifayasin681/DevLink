"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[60vh] py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred while loading this page. 
              Don't worry, it's not your fault!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error.message && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-mono text-muted-foreground">
                  {error.message}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
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
              If this problem persists, please{" "}
              <Link href="/contact" className="underline hover:text-foreground">
                contact support
              </Link>
              {error.digest && ` (Error ID: ${error.digest.slice(0, 8)})`}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}