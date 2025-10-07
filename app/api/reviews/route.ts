import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const reviews = await db.review.findMany({
      where: { userId },
      include: {
        reviewer: {
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

    const stats = await db.review.aggregate({
      where: { userId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0
      }
    })
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

    const { userId, rating, comment } = await request.json()

    if (!userId || !rating || !comment?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 })
    }

    const review = await db.review.upsert({
      where: {
        user_reviewer: {
          userId,
          reviewerId: session.user.id
        }
      },
      update: {
        rating,
        comment: comment.trim()
      },
      create: {
        userId,
        reviewerId: session.user.id,
        rating,
        comment: comment.trim()
      },
      include: {
        reviewer: {
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
    const reviewedUser = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, emailNotifications: true, username: true }
    })

    if (reviewedUser?.emailNotifications) {
      const template = {
        subject: `${review.reviewer.name} left you a review on DevLink`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Review!</h2>
            <p><strong>${review.reviewer.name}</strong> left you a ${rating}-star review:</p>
            <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0;">${comment}</blockquote>
            <a href="${process.env.NEXTAUTH_URL}/${reviewedUser.username}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>
          </div>
        `
      }
      await sendEmail({
        to: reviewedUser.email!,
        subject: template.subject,
        html: template.html
      })
    }

    return NextResponse.json({ review })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}