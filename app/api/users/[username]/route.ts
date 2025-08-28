import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: {
    username: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await db.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
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
        projects: {
          where: { featured: true },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            liveUrl: true,
            githubUrl: true,
            technologies: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" },
          take: 6
        },
        posts: {
          where: { published: true },
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            tags: true,
            imageUrl: true,
            readingTime: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" },
          take: 6
        },
        _count: {
          select: {
            projects: true,
            posts: { where: { published: true } }
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}