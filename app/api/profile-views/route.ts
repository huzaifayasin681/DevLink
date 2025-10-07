import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const viewerId = session?.user?.id
    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Don't track self-views
    if (viewerId === userId) {
      return NextResponse.json({ success: true })
    }

    // Check if this IP has viewed this profile recently (within 1 hour)
    const recentView = await db.profileView.findFirst({
      where: {
        userId,
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      }
    })

    if (!recentView) {
      await db.profileView.create({
        data: {
          userId,
          viewerId,
          ipAddress,
          userAgent
        }
      })

      await db.user.update({
        where: { id: userId },
        data: { profileViews: { increment: 1 } }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}