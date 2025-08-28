"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Github, Chrome, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'OAuthAccountNotLinked') {
      toast.error('An account with this email already exists. Please sign in with the original provider first.')
    }
  }, [searchParams])

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true)
    setProvider(providerId)

    try {
      const result = await signIn(providerId, {
        callbackUrl: providerId === "github" ? "/setup" : "/dashboard",
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'OAuthAccountNotLinked') {
          toast.error('An account with this email already exists. Please try in with the original provider first.')
        } else {
          toast.error("Something went wrong. Please try again.")
        }
      } else if (result?.url) {
        toast.success("Welcome to DevLink!")
        router.push(result.url)
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
      setProvider(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative">
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </Button>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-lg">DL</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to DevLink</CardTitle>
            <CardDescription>
              Sign in to create your developer profile and showcase your projects
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button
              className="w-full h-12"
              onClick={() => handleSignIn("github")}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading && provider === "github" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Github className="h-5 w-5 mr-2" />
              )}
              Continue with GitHub
            </Button>

            <Button
              className="w-full h-12"
              onClick={() => handleSignIn("google")}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading && provider === "google" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Chrome className="h-5 w-5 mr-2" />
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Trusted by developers</span>
              </div>
            </div>

            <div className="text-center space-y-2 pt-4">
              <p className="text-sm text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground pt-2">
                <span>✨ Free forever</span>
                <span>🔒 Secure & private</span>
                <span>🚀 Ready in 2 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            New to DevLink?{" "}
            <Link href="/explore" className="font-medium hover:underline">
              Explore developer profiles
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}