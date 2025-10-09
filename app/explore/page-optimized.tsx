// OPTIMIZED VERSION of explore/page.tsx
// This version uses server-side rendering with caching instead of client-side fetching

import Link from "next/link"
import { Suspense } from "react"
import { 
  Search, 
  MapPin, 
  Users,
  Code2,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { getInitials } from "@/lib/utils"
import { db } from "@/lib/db"
import { cachedQuery } from "@/lib/cache"

// Enable ISR
export const revalidate = 60 // Revalidate every 60 seconds

interface Developer {
  id: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
  location: string | null
  skills: string[]
  isAvailableForWork: boolean
  createdAt: Date
  _count: {
    projects: number
    posts: number
  }
}

async function getDevelopers(searchParams: {
  skill?: string
  location?: string
  available?: string
  sort?: string
}): Promise<Developer[]> {
  const cacheKey = `developers:${JSON.stringify(searchParams)}`
  
  return cachedQuery(cacheKey, async () => {
    const where: any = {
      AND: [
        { username: { not: null } },
        { name: { not: null } },
      ]
    }

    if (searchParams.skill) {
      where.AND.push({ skills: { has: searchParams.skill } })
    }

    if (searchParams.location) {
      where.AND.push({ 
        location: { 
          contains: searchParams.location, 
          mode: 'insensitive' 
        } 
      })
    }

    if (searchParams.available === 'true') {
      where.AND.push({ isAvailableForWork: true })
    }

    let orderBy: any = { createdAt: 'desc' }
    
    if (searchParams.sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (searchParams.sort === 'alphabetical') {
      orderBy = { name: 'asc' }
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
      orderBy,
      take: 50
    })
  }, 60)
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const developers = await getDevelopers(searchParams)

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Explore Developers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover talented developers from around the world. Find your next team member, 
            collaborator, or get inspired by amazing projects.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use URL parameters to filter: ?skill=React&location=London&available=true
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {developers.length} developer{developers.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Developer Grid */}
        {developers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">No developers found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search criteria to see more results.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/explore">Clear Filters</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

function DeveloperCard({ developer }: { developer: Developer }) {
  return (
    <Card className="card-hover">
      <CardHeader className="text-center">
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={developer.image || ""} alt={developer.name || ""} />
          <AvatarFallback className="text-lg">{getInitials(developer.name || "")}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <CardTitle>{developer.name}</CardTitle>
          <CardDescription>@{developer.username}</CardDescription>
          {developer.isAvailableForWork && (
            <Badge variant="success" className="w-fit mx-auto">
              Available for work
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        {developer.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {developer.bio}
          </p>
        )}

        {developer.location && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{developer.location}</span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-1">
          {developer.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {developer.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{developer.skills.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Code2 className="h-3 w-3" />
            <span>{developer._count.projects} projects</span>
          </div>
        </div>

        <Button className="w-full" asChild>
          <Link href={`/${developer.username}`}>
            View Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}


