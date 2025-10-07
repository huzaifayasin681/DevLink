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

    const body = await request.json()
    const { projectId, postId } = body
    
    if (!projectId && !postId) {
      return NextResponse.json({ error: "Project ID or Post ID required" }, { status: 400 })
    }

    if (projectId && postId) {
      return NextResponse.json({ error: "Cannot like both project and post" }, { status: 400 })
    }

    const userId = session.user.id
    
    // Check if like exists
    const existingLike = await db.like.findFirst({
      where: {
        userId,
        ...(projectId ? { projectId } : { postId })
      }
    })

    if (existingLike) {
      // Unlike: Delete the like and decrement count
      await db.like.delete({
        where: { id: existingLike.id }
      })
      
      if (projectId) {
        await db.project.update({
          where: { id: projectId },
          data: { likesCount: { decrement: 1 } }
        })
      } else if (postId) {
        await db.blogPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        })
      }
      
      return NextResponse.json({ liked: false })
    } else {
      // Like: Create the like and increment count
      try {
        await db.like.create({
          data: {
            userId,
            ...(projectId ? { projectId } : { postId })
          }
        })
        
        if (projectId) {
          const project = await db.project.update({
            where: { id: projectId },
            data: { likesCount: { increment: 1 } },
            include: { user: { select: { email: true, emailNotifications: true, username: true } } }
          })
          
          // Send email notification
          if (project.user.emailNotifications && project.userId !== userId) {
            const liker = await db.user.findUnique({ where: { id: userId }, select: { name: true } })
            if (liker?.name) {
              const template = emailTemplates.newLike(
                liker.name,
                project.title,
                `${process.env.NEXTAUTH_URL}/${project.user.username}/projects/${projectId}`
              )
              await sendEmail({
                to: project.user.email!,
                subject: template.subject,
                html: template.html
              })
            }
          }
        } else if (postId) {
          const post = await db.blogPost.update({
            where: { id: postId },
            data: { likesCount: { increment: 1 } },
            include: { user: { select: { email: true, emailNotifications: true, username: true } } }
          })
          
          // Send email notification
          if (post.user.emailNotifications && post.userId !== userId) {
            const liker = await db.user.findUnique({ where: { id: userId }, select: { name: true } })
            if (liker?.name) {
              const template = emailTemplates.newLike(
                liker.name,
                post.title,
                `${process.env.NEXTAUTH_URL}/${post.user.username}/blog/${post.slug}`
              )
              await sendEmail({
                to: post.user.email!,
                subject: template.subject,
                html: template.html
              })
            }
          }
        }
        
        return NextResponse.json({ liked: true })
      } catch (error: any) {
        // If unique constraint error, it means like was created by another request
        if (error.code === 'P2002' || error.message?.includes('duplicate key')) {
          return NextResponse.json({ liked: true })
        }
        throw error
      }
    }
  } catch (error) {
    console.error("Likes API error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}