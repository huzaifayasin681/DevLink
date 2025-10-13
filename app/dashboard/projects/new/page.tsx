"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { ProjectFormData } from "@/types"
import { createProject } from "@/lib/actions"
import { validateUrl } from "@/lib/utils"
import toast from "react-hot-toast"

const defaultValues: ProjectFormData = {
  title: "",
  description: "",
  content: "",
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  technologies: [],
  featured: false,
}

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newTechnology, setNewTechnology] = useState("")

  // Show AI feature toast on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      toast(
        "✨ Try our AI Generator! Paste a GitHub URL and let AI create your project description.",
        {
          icon: "🤖",
          duration: 5000,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          },
        }
      )
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<ProjectFormData>({
    defaultValues,
  })

  const technologies = watch("technologies") || []

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    
    try {
      await createProject(data)
      toast.success("Project created successfully!")
      router.push("/dashboard/projects")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project")
    } finally {
      setIsLoading(false)
    }
  }

  const addTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology.trim())) {
      setValue("technologies", [...technologies, newTechnology.trim()], { shouldDirty: true })
      setNewTechnology("")
    }
  }

  const removeTechnology = (techToRemove: string) => {
    setValue("technologies", technologies.filter(tech => tech !== techToRemove), { shouldDirty: true })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTechnology()
    }
  }

  const generateDescription = async () => {
    const githubUrl = watch("githubUrl")

    if (!githubUrl) {
      toast.error("Please enter a GitHub URL first")
      return
    }

    setIsGenerating(true)
    try {
      // Extract owner and repo from GitHub URL
      let cleanUrl = githubUrl.replace("https://github.com/", "").replace("http://github.com/", "")
      cleanUrl = cleanUrl.replace(".git", "") // Remove .git extension
      const urlParts = cleanUrl.split("/")
      
      if (urlParts.length < 2) {
        throw new Error("Invalid GitHub URL")
      }

      const owner = urlParts[0]
      const repo = urlParts[1]

      // Fetch repo data from GitHub
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (!repoRes.ok) throw new Error("Repository not found")
      const repoData = await repoRes.json()

      // Fetch languages
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`)
      const languages = langRes.ok ? Object.keys(await langRes.json()).slice(0, 5) : []

      // Generate with AI
      const res = await fetch("/api/ai/generate-project-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: repoData.name,
          technologies: [...languages, ...(repoData.topics || [])],
          githubUrl,
          existingDescription: repoData.description,
        }),
      })

      if (!res.ok) throw new Error("Failed to generate")

      const data = await res.json()
      setValue("title", data.title, { shouldDirty: true })
      setValue("description", data.description, { shouldDirty: true })
      setValue("liveUrl", repoData.homepage || "", { shouldDirty: true })
      if (data.tags?.length > 0) {
        setValue("technologies", data.tags, { shouldDirty: true })
      }
      if (data.features?.length > 0) {
        const featuresText = data.features.map((f: string) => `• ${f}`).join("\n")
        setValue("content", featuresText, { shouldDirty: true })
      }
      toast.success("Project details generated from GitHub!")
    } catch (error: any) {
      toast.error(error.message || "Failed to generate description")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">Add a new project to your portfolio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Basic information about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    {...register("title", { 
                      required: "Project title is required",
                      minLength: { value: 3, message: "Title must be at least 3 characters" }
                    })}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Input
                    id="description"
                    {...register("description", {
                      required: "Description is required",
                      minLength: { value: 10, message: "Description must be at least 10 characters" }
                    })}
                    placeholder="Brief description of your project"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This will appear on project cards and search results
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Detailed Description</Label>
                  <Textarea
                    id="content"
                    {...register("content")}
                    placeholder="Detailed description of your project, features, challenges faced, etc."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Provide more details about your project for the full project page
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Media & Links */}
            <Card>
              <CardHeader>
                <CardTitle>Media & Links</CardTitle>
                <CardDescription>
                  Add images and links to showcase your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Project Image</Label>
                  <Input
                    id="imageUrl"
                    {...register("imageUrl", {
                      validate: (value) => !value || validateUrl(value) || "Please enter a valid image URL"
                    })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional: URL to a screenshot or demo image of your project
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="liveUrl">Live Demo URL</Label>
                    <Input
                      id="liveUrl"
                      {...register("liveUrl", {
                        validate: (value) => !value || validateUrl(value) || "Please enter a valid URL"
                      })}
                      placeholder="https://your-project.vercel.app"
                    />
                    {errors.liveUrl && (
                      <p className="text-sm text-destructive">{errors.liveUrl.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="githubUrl">GitHub Repository</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateDescription}
                        disabled={isGenerating || !watch("githubUrl")}
                      >
                        {isGenerating ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-2" />
                        )}
                        {isGenerating ? "Generating..." : "AI Generate"}
                      </Button>
                    </div>
                    <Input
                      id="githubUrl"
                      {...register("githubUrl", {
                        validate: (value) => !value || validateUrl(value) || "Please enter a valid GitHub URL"
                      })}
                      placeholder="https://github.com/username/repo"
                    />
                    {errors.githubUrl && (
                      <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      💡 Add GitHub URL and click AI Generate to auto-fill everything
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies Used</CardTitle>
                <CardDescription>
                  Add the technologies and tools used in this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a technology..."
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" onClick={addTechnology} disabled={!newTechnology.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTechnology(tech)}
                        >
                          {tech}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}

                  {technologies.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No technologies added yet. Add technologies like React, Node.js, etc.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Configure how this project appears on your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => 
                      setValue("featured", checked, { shouldDirty: true })
                    }
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Featured projects will be prominently displayed on your profile and have priority in search results
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/projects">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}