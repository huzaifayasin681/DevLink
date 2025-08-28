import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { generateSlug, calculateReadingTime } from "@/lib/utils"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const post = await db.blogPost.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            username: true,
            name: true,
            image: true
          }
        }
      }
    })
    
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }
    
    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if post exists and user owns it
    const existingPost = await db.blogPost.findUnique({
      where: { id: params.id }
    })
    
    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }
    
    if (existingPost.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.content || !data.excerpt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Generate slug if changed
    const slug = data.slug || generateSlug(data.title)
    
    // Check if slug is taken by another post
    if (slug !== existingPost.slug) {
      const slugTaken = await db.blogPost.findUnique({
        where: { slug }
      })
      
      if (slugTaken && slugTaken.id !== params.id) {
        return NextResponse.json(
          { error: "A post with this URL already exists" },
          { status: 400 }
        )
      }
    }
    
    // Calculate reading time
    const readingTime = calculateReadingTime(data.content)
    
    const post = await db.blogPost.update({
      where: { id: params.id },
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug,
        published: data.published || false,
        tags: data.tags || [],
        imageUrl: data.imageUrl || null,
        readingTime,
      },
      include: {
        user: {
          select: {
            username: true,
            name: true,
            image: true
          }
        }
      }
    })
    
    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if post exists and user owns it
    const existingPost = await db.blogPost.findUnique({
      where: { id: params.id }
    })
    
    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }
    
    if (existingPost.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    await db.blogPost.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: "Blog post deleted successfully" })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    )
  }
}