"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Github, Chrome, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { DevLinkLogo } from "@/components/devlink-logo"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'OAuthAccountNotLinked') {
      toast.error('An account with this email already exists. Please sign in with the original provider first.')
    } else if (error === 'pending_approval') {
      toast.error('Your developer account is pending approval. Please contact the admin.')
    }
  }, [searchParams])

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true)
    setProvider(providerId)

    try {
      const result = await signIn(providerId, {
        callbackUrl: providerId === "google" ? "/client/dashboard" : "/developer/dashboard",
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'OAuthAccountNotLinked') {
          toast.error('An account with this email already exists. Please sign in with the original provider first.')
        } else {
          toast.error("Something went wrong. Please try again.")
        }
      } else if (result?.url) {
        const message = providerId === "google" ? "Welcome, Client!" : "Welcome, Developer!"
        toast.success(message)
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
              <DevLinkLogo size="md" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to DevLink</CardTitle>
            <CardDescription>
              Choose your account type to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* CLIENT LOGIN */}
            <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">For Clients</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Request services and track your projects
                </p>
              </div>
              <Button
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleSignIn("google")}
                disabled={isLoading}
              >
                {isLoading && provider === "google" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                ) : (
                  <Chrome className="h-5 w-5 mr-2" />
                )}
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* DEVELOPER LOGIN */}
            <div className="space-y-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <div>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">For Developers (Staff Only)</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Manage client requests and showcase your portfolio
                </p>
              </div>
              <Button
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleSignIn("github")}
                disabled={isLoading}
              >
                {isLoading && provider === "github" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                ) : (
                  <Github className="h-5 w-5 mr-2" />
                )}
                Continue with GitHub
              </Button>
              <p className="text-xs text-purple-600 dark:text-purple-400 text-center">
                ⚠️ Requires admin approval
              </p>
            </div>

            <div className="text-center space-y-2 pt-2">
              <p className="text-xs text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Want to explore?{" "}
            <Link href="/explore" className="font-medium hover:underline text-blue-600 dark:text-blue-400">
              View developer portfolios
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            🔒 Secure • ⚡ Fast • 🎯 Purpose-built
          </p>
        </div>
      </div>
    </div>
  )
}