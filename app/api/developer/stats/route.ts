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

    const [projectCount, pendingRequests, activeRequests, completedRequests] = await Promise.all([
      db.project.count({ where: { userId: session.user.id } }),
      db.serviceRequest.count({ where: { status: "pending" } }),
      db.serviceRequest.count({ where: { assignedTo: session.user.id, status: "in_progress" } }),
      db.serviceRequest.count({ where: { assignedTo: session.user.id, status: "completed" } })
    ])

    return NextResponse.json({
      stats: {
        projects: projectCount,
        requests: pendingRequests,
        active: activeRequests,
        completed: completedRequests
      }
    })
  } catch (error) {
    console.error("Error fetching developer stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
