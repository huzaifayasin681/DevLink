import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, budget, timeline, priority } = body

    const serviceRequest = await db.serviceRequest.create({
      data: {
        title,
        description,
        category,
        budget,
        timeline,
        priority: priority || "medium",
        clientId: session.user.id,
        status: "pending"
      }
    })

    return NextResponse.json(serviceRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating service request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let requests

    if (session.user.role === "client") {
      requests = await db.serviceRequest.findMany({
        where: { clientId: session.user.id },
        include: {
          developer: {
            select: { id: true, name: true, image: true, username: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    } else if (session.user.role === "developer") {
      requests = await db.serviceRequest.findMany({
        include: {
          client: {
            select: { id: true, name: true, email: true, companyName: true }
          },
          developer: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    }

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching service requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
