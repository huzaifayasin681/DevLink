"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import toast from "react-hot-toast"

export default function TestEmailPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)

  const sendTestEmail = async (type: string) => {
    if (!session) {
      toast.error("Please login first")
      return
    }

    setLoading(type)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.error || "Failed to send email")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setLoading(null)
    }
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Email Testing</CardTitle>
              <CardDescription>Please login to test email notifications</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Email Notification Testing</CardTitle>
            <CardDescription>
              Test different types of email notifications. Emails will be sent to: {session.user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button 
                onClick={() => sendTestEmail("basic")}
                disabled={loading === "basic"}
                variant="outline"
              >
                {loading === "basic" ? "Sending..." : "Send Basic Test Email"}
              </Button>
              
              <Button 
                onClick={() => sendTestEmail("follow")}
                disabled={loading === "follow"}
                variant="outline"
              >
                {loading === "follow" ? "Sending..." : "Test New Follower Email"}
              </Button>
              
              <Button 
                onClick={() => sendTestEmail("like")}
                disabled={loading === "like"}
                variant="outline"
              >
                {loading === "like" ? "Sending..." : "Test New Like Email"}
              </Button>
              
              <Button 
                onClick={() => sendTestEmail("comment")}
                disabled={loading === "comment"}
                variant="outline"
              >
                {loading === "comment" ? "Sending..." : "Test New Comment Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}