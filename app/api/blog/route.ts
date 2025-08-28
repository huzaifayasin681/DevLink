import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { generateSlug, calculateReadingTime } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const published = searchParams.get("published")
    const tag = searchParams.get("tag")
    const limit = searchParams.get("limit")
    const page = searchParams.get("page")
    
    // Build query conditions
    const where: any = {}
    
    if (username) {
      const user = await db.user.findUnique({
        where: { username },
        select: { id: true }
      })
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      where.userId = user.id
    }
    
    if (published === "true") {
      where.published = true
    }
    
    if (tag) {
      where.tags = {
        has: tag
      }
    }
    
    // Calculate pagination
    const pageSize = limit ? parseInt(limit) : 10
    const currentPage = page ? parseInt(page) : 1
    const skip = (currentPage - 1) * pageSize
    
    // Get blog posts with user data
    const posts = await db.blogPost.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: pageSize,
      skip
    })
    
    // Get total count for pagination
    const totalCount = await db.blogPost.count({ where })
    
    return NextResponse.json({
      posts,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.content || !data.excerpt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.title)
    
    // Check if slug is taken
    const existingPost = await db.blogPost.findUnique({
      where: { slug }
    })
    
    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this URL already exists" },
        { status: 400 }
      )
    }
    
    // Calculate reading time
    const readingTime = calculateReadingTime(data.content)
    
    const post = await db.blogPost.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug,
        published: data.published || false,
        tags: data.tags || [],
        imageUrl: data.imageUrl || null,
        readingTime,
        userId: session.user.id,
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
    
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    )
  }
}