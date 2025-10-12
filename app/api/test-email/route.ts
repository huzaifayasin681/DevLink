import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  console.log('=== TEST EMAIL ROUTE CALLED ===')
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.email)
    if (!session?.user?.email) {
      console.log('No session or email')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type } = await request.json()
    console.log('Email type:', type)

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
          `${process.env.NEXTAUTH_URL}/testuser/projects/123`,
          "project"
        )
        break
      case 'comment':
        template = emailTemplates.newComment(
          "Test User",
          "My Awesome Project",
          "This is a test comment to verify email notifications are working!",
          `${process.env.NEXTAUTH_URL}/testuser/projects/123`,
          "project"
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

    console.log('About to send email to:', session.user.email)
    await sendEmail({
      to: session.user.email,
      subject: template.subject,
      html: template.html
    })
    console.log('Email sent successfully')

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${session.user.email}` 
    })
  } catch (error) {
    console.error("=== TEST EMAIL ERROR ===")
    console.error("Error:", error)
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ 
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}