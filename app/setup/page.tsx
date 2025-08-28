"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { Github, Star, GitFork, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"

interface GitHubRepo {
  id: number
  name: string
  description: string
  html_url: string
  homepage: string
  language: string
  stargazers_count: number
  fork: boolean
  updated_at: string
}

export default function SetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [selectedRepos, setSelectedRepos] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchRepos()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [session, status, router])

  const fetchRepos = async () => {
    try {
      const response = await fetch("/api/github/repos")
      if (response.ok) {
        const data = await response.json()
        setRepos(data.repos || [])
      } else {
        toast.error("Failed to fetch repositories")
      }
    } catch (error) {
      toast.error("Error fetching repositories")
    } finally {
      setLoading(false)
    }
  }

  const handleRepoToggle = (repoId: number) => {
    setSelectedRepos(prev => {
      if (prev.includes(repoId)) {
        return prev.filter(id => id !== repoId)
      } else if (prev.length < 10) {
        return [...prev, repoId]
      } else {
        toast.error("You can select maximum 10 repositories")
        return prev
      }
    })
  }

  const handleImport = async () => {
    if (selectedRepos.length === 0) {
      toast.error("Please select at least one repository")
      return
    }

    setImporting(true)
    try {
      const response = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoIds: selectedRepos })
      })

      if (response.ok) {
        toast.success("Repositories imported successfully!")
        router.push("/dashboard")
      } else {
        toast.error("Failed to import repositories")
      }
    } catch (error) {
      toast.error("Error importing repositories")
    } finally {
      setImporting(false)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  if (status === "loading" || loading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your repositories...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-12">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Github className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to DevLink!</h1>
          <p className="text-muted-foreground text-lg">
            Select up to 10 repositories to showcase as projects on your profile
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your GitHub Repositories</span>
              <Badge variant="secondary">
                {selectedRepos.length}/10 selected
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {repos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No repositories found or repositories are private
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRepos.includes(repo.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleRepoToggle(repo.id)}
                  >
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                      selectedRepos.includes(repo.id) 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-muted-foreground'
                    }`}>
                      {selectedRepos.includes(repo.id) && (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{repo.name}</h3>
                        {repo.fork && <GitFork className="h-4 w-4 text-muted-foreground" />}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {repo.language && (
                          <Badge variant="outline" className="text-xs">
                            {repo.language}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={importing || selectedRepos.length === 0}
          >
            {importing ? "Importing..." : `Import ${selectedRepos.length} repositories`}
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}