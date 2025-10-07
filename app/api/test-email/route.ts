import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type } = await request.json()

    let template
    switch (type) {
      case 'follow':
        template = emailTemplates.newFollower(
          "Test User",
          `${process.env.NEXTAUTH_URL}/testuser`
        )
        break
      case 'like':
        template = emailTemplates.newLike(
          "Test User",
          "My Awesome Project",
          `${process.env.NEXTAUTH_URL}/testuser/projects/123`
        )
        break
      case 'comment':
        template = emailTemplates.newComment(
          "Test User",
          "My Awesome Project",
          "This is a test comment to verify email notifications are working!",
          `${process.env.NEXTAUTH_URL}/testuser/projects/123`
        )
        break
      default:
        template = {
          subject: "DevLink Email Test",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Email Test Successful!</h2>
              <p>Your email configuration is working correctly.</p>
              <p>This test was sent to: ${session.user.email}</p>
            </div>
          `
        }
    }

    await sendEmail({
      to: session.user.email,
      subject: template.subject,
      html: template.html
    })

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${session.user.email}` 
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({ 
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}