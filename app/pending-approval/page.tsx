"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Clock, Mail, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DevLinkLogo } from "@/components/devlink-logo"

export default function PendingApprovalPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.approved) {
      router.push("/developer/dashboard")
    }
  }, [session, status, router])

  const handleRefresh = async () => {
    await update()
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <DevLinkLogo size="md" />
          </div>
          <div className="mx-auto w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Approval Pending</CardTitle>
          <CardDescription className="text-base">
            Your developer account is awaiting admin approval
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Account Details
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  <strong>Name:</strong> {session?.user?.name}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Email:</strong> {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>An administrator will review your GitHub profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>You'll receive an email notification once approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Approval typically takes 24-48 hours</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Approval Status
            </Button>
            
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="ghost"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:admin@devlink.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                admin@devlink.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
