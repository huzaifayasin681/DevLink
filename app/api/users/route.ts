import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
          emailNotifications: true,
          profileViews: true,
          createdAt: true
        }
      })
      
      return NextResponse.json({ user })
    }
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const skill = searchParams.get("skill") || ""
    const location = searchParams.get("location") || ""
    const availableForWork = searchParams.get("availableForWork")
    const sortBy = searchParams.get("sortBy") || "newest"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      AND: [
        { username: { not: null } },
        { name: { not: null } }
      ]
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { skills: { hasSome: [search] } }
      ]
    }

    if (skill) {
      where.skills = { has: skill }
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    if (availableForWork !== null) {
      where.isAvailableForWork = availableForWork === "true"
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" }
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "alphabetical":
        orderBy = { name: "asc" }
        break
      case "mostProjects":
        orderBy = { projects: { _count: "desc" } }
        break
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          location: true,
          skills: true,
          isAvailableForWork: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              posts: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}