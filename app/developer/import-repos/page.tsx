"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Github, Star, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import toast from "react-hot-toast"

export default function ImportReposPage() {
  const router = useRouter()
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    fetchRepos()
  }, [])

  const fetchRepos = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/github/repos")
      const data = await res.json()
      if (data.repos) {
        setRepos(data.repos)
      } else {
        toast.error(data.error || "Failed to fetch repos")
      }
    } catch (error) {
      toast.error("Error fetching repositories")
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one repository")
      return
    }

    setImporting(true)
    try {
      const res = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoIds: selected })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Successfully imported ${data.imported} projects!`)
        router.push("/developer/dashboard")
      } else {
        toast.error(data.error || "Failed to import")
      }
    } catch (error) {
      toast.error("Error importing repositories")
    } finally {
      setImporting(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/developer/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Github className="h-6 w-6" />
                  Import GitHub Repositories
                </CardTitle>
                <CardDescription className="mt-2">
                  Select repositories to import as portfolio projects
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRepos} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading repositories...</p>
              </div>
            ) : repos.length === 0 ? (
              <div className="text-center py-12">
                <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No repositories found</h3>
                <p className="text-sm text-muted-foreground">
                  Create some repositories on GitHub first
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {selected.length} of {repos.length} selected
                  </p>
                  <Button
                    onClick={handleImport}
                    disabled={selected.length === 0 || importing}
                  >
                    {importing ? (
                      <>Importing...</>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Import Selected ({selected.length})
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  {repos.map((repo) => (
                    <Card key={repo.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selected.includes(repo.id)}
                            onCheckedChange={() => toggleSelect(repo.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{repo.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {repo.description || "No description"}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={repo.html_url} target="_blank">
                                  <Github className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              {repo.language && (
                                <Badge variant="outline">{repo.language}</Badge>
                              )}
                              {repo.stargazers_count > 0 && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3" />
                                  {repo.stargazers_count}
                                </div>
                              )}
                              {repo.fork && (
                                <Badge variant="secondary" className="text-xs">Fork</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
