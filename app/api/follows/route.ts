import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { followingId } = await request.json()
    
    if (!followingId) {
      return NextResponse.json({ error: "Following ID required" }, { status: 400 })
    }

    if (followingId === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const existingFollow = await db.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId
      }
    })

    if (existingFollow) {
      await db.follow.delete({ where: { id: existingFollow.id } })
      return NextResponse.json({ following: false })
    } else {
      await db.follow.create({
        data: {
          followerId: session.user.id,
          followingId
        }
      })
      
      // Send email notification
      const [follower, following] = await Promise.all([
        db.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
        db.user.findUnique({ where: { id: followingId }, select: { email: true, emailNotifications: true, username: true } })
      ])
      
      if (following?.emailNotifications && follower?.name) {
        const template = emailTemplates.newFollower(
          follower.name,
          `${process.env.NEXTAUTH_URL}/${following.username}`
        )
        await sendEmail({
          to: following.email!,
          subject: template.subject,
          html: template.html
        })
      }
      
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}