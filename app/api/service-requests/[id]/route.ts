import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates } from "@/lib/email"

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

    // Get the original request for notifications
    const originalRequest = await db.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            emailNotifications: true,
            companyName: true
          }
        },
        developer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!originalRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    let updateData: any = rest
    let sendNotification = false
    let notificationTemplate: any = null
    const oldStatus = originalRequest.status

    if (action === "accept") {
      updateData = {
        status: "in_progress",
        assignedTo: session.user.id
      }
      sendNotification = true

      // Get developer name
      const developer = await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true }
      })

      if (developer?.name) {
        const requestUrl = `${process.env.NEXTAUTH_URL}/client/requests`
        notificationTemplate = emailTemplates.serviceRequestAssigned(
          developer.name,
          originalRequest.title,
          requestUrl
        )
      }
    } else if (action === "reject") {
      updateData = {
        status: "rejected"
      }
      sendNotification = true

      const requestUrl = `${process.env.NEXTAUTH_URL}/client/requests`
      notificationTemplate = emailTemplates.serviceRequestStatusChanged(
        originalRequest.title,
        oldStatus,
        "rejected",
        requestUrl
      )
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

      sendNotification = true
      const requestUrl = `${process.env.NEXTAUTH_URL}/client/requests`
      notificationTemplate = emailTemplates.serviceRequestCompleted(
        originalRequest.title,
        requestUrl
      )
    } else if (status && status !== oldStatus) {
      updateData.status = status
      sendNotification = true

      const requestUrl = `${process.env.NEXTAUTH_URL}/client/requests`
      notificationTemplate = emailTemplates.serviceRequestStatusChanged(
        originalRequest.title,
        oldStatus,
        status,
        requestUrl
      )
    }

    const updated = await db.serviceRequest.update({
      where: { id: params.id },
      data: updateData
    })

    // Send email notification to client
    if (sendNotification && notificationTemplate && originalRequest.client.email && originalRequest.client.emailNotifications) {
      sendEmail({
        to: originalRequest.client.email,
        subject: notificationTemplate.subject,
        html: notificationTemplate.html
      }).catch(err => console.error('Failed to send service request notification:', err))
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
