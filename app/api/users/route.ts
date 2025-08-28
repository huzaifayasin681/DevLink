import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const current = searchParams.get("current")
    
    // Handle current user request
    if (current === "true") {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          bio: true,
          location: true,
          website: true,
          github: true,
          twitter: true,
          linkedin: true,
          skills: true,
          isAvailableForWork: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      return NextResponse.json({ user })
    }
    
    const search = searchParams.get("search")
    const availableForWork = searchParams.get("availableForWork")
    const limit = searchParams.get("limit")
    const page = searchParams.get("page")
    
    // Build query conditions - only show users with complete profiles
    const where: any = {
      AND: [
        { username: { not: null } },
        { name: { not: null } }
      ]
    }
    
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { bio: { contains: search, mode: "insensitive" } },
          { skills: { has: search } }
        ]
      })
    }
    
    if (availableForWork === "true") {
      where.AND.push({ isAvailableForWork: true })
    }
    
    // Calculate pagination
    const pageSize = limit ? parseInt(limit) : 12
    const currentPage = page ? parseInt(page) : 1
    const skip = (currentPage - 1) * pageSize
    
    // Get users
    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        skills: true,
        isAvailableForWork: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            posts: { where: { published: true } }
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
    const totalCount = await db.user.count({ where })
    
    return NextResponse.json({
      users,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const data = await request.json()
    
    // Check if username is taken by another user
    if (data.username) {
      const existingUser = await db.user.findUnique({
        where: { username: data.username }
      })
      
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        )
      }
    }
    
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        username: data.username,
        bio: data.bio,
        location: data.location,
        website: data.website,
        github: data.github,
        twitter: data.twitter,
        linkedin: data.linkedin,
        skills: data.skills || [],
        isAvailableForWork: data.isAvailableForWork || false,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        twitter: true,
        linkedin: true,
        skills: true,
        isAvailableForWork: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}