import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const post = await db.blogPost.findUnique({
      where: { 
        slug: params.slug,
        published: true // Only return published posts for public access
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
    
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }
    
    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching blog post by slug:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    )
  }
}