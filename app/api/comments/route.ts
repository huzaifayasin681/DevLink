import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const postId = searchParams.get("postId")

    if (!projectId && !postId) {
      return NextResponse.json({ error: "Project ID or Post ID required" }, { status: 400 })
    }

    const comments = await db.comment.findMany({
      where: {
        ...(projectId ? { projectId } : { postId })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, projectId, postId } = await request.json()
    
    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 })
    }

    if (!projectId && !postId) {
      return NextResponse.json({ error: "Project ID or Post ID required" }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        ...(projectId ? { projectId } : { postId })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    // Send email notification
    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: { user: { select: { email: true, emailNotifications: true, username: true } } }
      })
      
      if (project?.user.emailNotifications && project.userId !== session.user.id) {
        const template = emailTemplates.newComment(
          comment.user.name || 'Someone',
          project.title,
          content.trim(),
          `${process.env.NEXTAUTH_URL}/${project.user.username}/projects/${projectId}`,
          'project'
        )
        await sendEmail({
          to: project.user.email!,
          subject: template.subject,
          html: template.html
        })
      }
    } else if (postId) {
      const post = await db.blogPost.findUnique({
        where: { id: postId },
        include: { user: { select: { email: true, emailNotifications: true, username: true } } }
      })
      
      if (post?.user.emailNotifications && post.userId !== session.user.id) {
        const template = emailTemplates.newComment(
          comment.user.name || 'Someone',
          post.title,
          content.trim(),
          `${process.env.NEXTAUTH_URL}/${post.user.username}/blog/${post.slug}`,
          'blog post'
        )
        await sendEmail({
          to: post.user.email!,
          subject: template.subject,
          html: template.html
        })
      }
    }

    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
