"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Search, 
  MapPin, 
  Filter,
  X,
  Users,
  Code2,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MainLayout } from "@/components/main-layout"
import { getInitials, debounce } from "@/lib/utils"

interface Developer {
  id: string
  name: string
  username: string
  image?: string
  bio?: string
  location?: string
  skills: string[]
  isAvailableForWork: boolean
  createdAt: Date
  _count: {
    projects: number
    posts: number
  }
}

const skillOptions = [
  "React", "TypeScript", "Node.js", "Python", "Go", "Swift", "Kotlin",
  "Vue.js", "Angular", "PostgreSQL", "MongoDB", "AWS", "Docker", 
  "Kubernetes", "Firebase", "GraphQL", "Next.js", "TensorFlow"
]

const locationOptions = [
  "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA",
  "Toronto, ON", "London, UK", "São Paulo, BR", "Mumbai, IN",
  "Berlin, DE", "Amsterdam, NL"
]

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [availableOnly, setAvailableOnly] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch developers from API
  useEffect(() => {
    fetchDevelopers()
  }, [])

  // Debounced search function
  const debouncedSearch = debounce(() => {
    filterDevelopers()
  }, 300)

  useEffect(() => {
    debouncedSearch()
  }, [searchTerm, selectedSkill, selectedLocation, availableOnly, sortBy, developers])

  const fetchDevelopers = async () => {
    try {
      setError(null)
      const response = await fetch('/api/users?limit=50')
      if (response.ok) {
        const data = await response.json()
        setDevelopers(data.users || [])
        setFilteredDevelopers(data.users || [])
      } else {
        setError('Failed to load developers')
      }
    } catch (error) {
      console.error('Failed to fetch developers:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const filterDevelopers = () => {
    let filtered = [...developers]

    // Search by name, username, bio, or skills
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(dev => 
        dev.name?.toLowerCase().includes(searchLower) ||
        dev.username.toLowerCase().includes(searchLower) ||
        dev.bio?.toLowerCase().includes(searchLower) ||
        dev.skills.some(skill => skill.toLowerCase().includes(searchLower))
      )
    }

    // Filter by skill
    if (selectedSkill) {
      filtered = filtered.filter(dev => 
        dev.skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase())
      )
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(dev => 
        dev.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    // Filter by availability
    if (availableOnly !== null) {
      filtered = filtered.filter(dev => dev.isAvailableForWork === availableOnly)
    }

    // Sort results
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "mostProjects":
        filtered.sort((a, b) => b._count.projects - a._count.projects)
        break
      case "alphabetical":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
    }

    setFilteredDevelopers(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSkill("")
    setSelectedLocation("")
    setAvailableOnly(null)
    setSortBy("newest")
  }

  const hasActiveFilters = searchTerm || selectedSkill || selectedLocation || availableOnly !== null

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

        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search developers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Skill Filter */}
                <Select value={selectedSkill} onValueChange={(value) => setSelectedSkill(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {skillOptions.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Location Filter */}
                <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="mostProjects">Most Projects</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={availableOnly === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAvailableOnly(availableOnly === true ? null : true)}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Available for Work
                  </Button>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredDevelopers.length} developer{filteredDevelopers.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDevelopers} disabled={loading}>
            Refresh
          </Button>
        </div>

        {error ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Error Loading Developers</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchDevelopers}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="text-center">
                  <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="flex gap-2 justify-center">
                      <div className="h-6 bg-muted rounded w-16" />
                      <div className="h-6 bg-muted rounded w-16" />
                      <div className="h-6 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDevelopers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDevelopers.map((developer) => (
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
                    {hasActiveFilters 
                      ? "Try adjusting your search criteria or clearing filters to see more results."
                      : "Be the first developer to join our community!"
                    }
                  </p>
                </div>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/login">
                      Join Our Community
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {filteredDevelopers.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Developers
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

interface DeveloperCardProps {
  developer: Developer
}

function DeveloperCard({ developer }: DeveloperCardProps) {
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
          <p className="text-sm text-muted-foreground leading-relaxed">
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
          <span>Joined {new Date(developer.createdAt).getFullYear()}</span>
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