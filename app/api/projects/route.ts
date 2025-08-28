import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const featured = searchParams.get("featured")
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
    
    if (featured === "true") {
      where.featured = true
    }
    
    // Calculate pagination
    const pageSize = limit ? parseInt(limit) : 10
    const currentPage = page ? parseInt(page) : 1
    const skip = (currentPage - 1) * pageSize
    
    // Get projects with user data
    const projects = await db.project.findMany({
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
    const totalCount = await db.project.count({ where })
    
    return NextResponse.json({
      projects,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    if (!data.title || !data.description || !data.content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const project = await db.project.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl || null,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        technologies: data.technologies || [],
        featured: data.featured || false,
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
    
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}