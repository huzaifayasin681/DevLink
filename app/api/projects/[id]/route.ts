import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const project = await db.project.findUnique({
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
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    
    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
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
    
    // Check if project exists and user owns it
    const existingProject = await db.project.findUnique({
      where: { id: params.id }
    })
    
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    
    if (existingProject.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.description || !data.content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const project = await db.project.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl || null,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        technologies: data.technologies || [],
        featured: data.featured || false,
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
    
    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
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
    
    // Check if project exists and user owns it
    const existingProject = await db.project.findUnique({
      where: { id: params.id }
    })
    
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    
    if (existingProject.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    await db.project.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}