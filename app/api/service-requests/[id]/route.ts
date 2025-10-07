import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, email: true, companyName: true } },
        developer: { select: { id: true, name: true, image: true, username: true } }
      }
    })

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(request)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "developer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { action, status, ...rest } = body

    let updateData: any = rest

    if (action === "accept") {
      updateData = {
        status: "in_progress",
        assignedTo: session.user.id
      }
    } else if (action === "reject") {
      updateData = {
        status: "rejected"
      }
    } else if (status === "completed") {
      // Get the request to create project
      const request = await db.serviceRequest.findUnique({
        where: { id: params.id },
        include: { client: true }
      })

      if (request && request.assignedTo && !request.projectId) {
        // Create project from completed request
        const project = await db.project.create({
          data: {
            title: request.title,
            description: request.description,
            content: `# ${request.title}\n\n${request.description}\n\n## Client\n${request.client.name}${request.client.companyName ? ` (${request.client.companyName})` : ''}\n\n## Project Details\n- **Budget**: ${request.budget || 'Not specified'}\n- **Timeline**: ${request.timeline || 'Not specified'}\n- **Category**: ${request.category}\n\nThis project was completed as part of a client service request.`,
            technologies: [request.category],
            featured: false,
            userId: request.assignedTo
          }
        })

        updateData = {
          status: "completed",
          projectId: project.id
        }
      } else {
        updateData.status = status
      }
    } else if (status) {
      updateData.status = status
    }

    const updated = await db.serviceRequest.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
