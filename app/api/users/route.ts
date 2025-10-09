import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cachedQuery } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const skill = searchParams.get('skill')
    const location = searchParams.get('location')
    const available = searchParams.get('available')

    // Build cache key
    const cacheKey = `users:${limit}:${offset}:${skill}:${location}:${available}`

    // Use cached query
    const users = await cachedQuery(
      cacheKey,
      async () => {
        const where: any = {
          AND: [
            { username: { not: null } },
            { name: { not: null } },
          ]
        }

        if (skill) {
          where.AND.push({ skills: { has: skill } })
        }

        if (location) {
          where.AND.push({ location: { contains: location, mode: 'insensitive' } })
        }

        if (available === 'true') {
          where.AND.push({ isAvailableForWork: true })
        }

        return await db.user.findMany({
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
                posts: { where: { published: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        })
      },
      60 // Cache for 60 seconds
    )

    return NextResponse.json(
      { users, count: users.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
