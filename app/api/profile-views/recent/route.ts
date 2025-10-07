import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [views, user] = await Promise.all([
      db.profileView.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          viewer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { profileViews: true }
      })
    ])

    return NextResponse.json({ 
      views, 
      totalViews: user?.profileViews || 0 
    })
  } catch (error) {
    console.error("Recent profile views API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}