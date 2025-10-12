import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        role: true,
        approved: true,
        isAdmin: true,
        companyName: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, approved, isAdmin } = body

    // Get user before update to check status change
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        approved: true,
        isAdmin: true,
        email: true,
        name: true,
        emailNotifications: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (typeof approved === "boolean") updateData.approved = approved
    if (typeof isAdmin === "boolean") updateData.isAdmin = isAdmin

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData
    })

    // Send email notifications based on changes
    if (user.email && user.emailNotifications && user.name) {
      const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`

      // Developer approved notification
      if (typeof approved === "boolean" && approved !== user.approved && user.role === "developer") {
        if (approved) {
          const template = emailTemplates.developerApproved(user.name, dashboardUrl)
          sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html
          }).catch(err => console.error('Failed to send developer approved email:', err))
        } else if (!approved && user.approved) {
          const template = emailTemplates.developerRejected(user.name, "Your account has been deactivated by an administrator.")
          sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html
          }).catch(err => console.error('Failed to send developer rejected email:', err))
        }
      }

      // Promoted to admin notification
      if (typeof isAdmin === "boolean" && isAdmin && !user.isAdmin) {
        const template = emailTemplates.promotedToAdmin(user.name, `${process.env.NEXTAUTH_URL}/admin/dashboard`)
        sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        }).catch(err => console.error('Failed to send admin promotion email:', err))
      }
    }

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
