"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { ProjectFormData } from "@/types"
import { updateProject, deleteProject } from "@/lib/actions"
import { validateUrl } from "@/lib/utils"
import toast from "react-hot-toast"

interface EditProjectPageProps {
  params: { id: string }
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newTechnology, setNewTechnology] = useState("")
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<ProjectFormData>()

  const technologies = watch("technologies") || []

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`)
        if (!response.ok) {
          throw new Error("Project not found")
        }
        const data = await response.json()
        setProject(data)
        reset({
          title: data.title,
          description: data.description,
          content: data.content,
          imageUrl: data.imageUrl || "",
          liveUrl: data.liveUrl || "",
          githubUrl: data.githubUrl || "",
          technologies: data.technologies,
          featured: data.featured,
        })
      } catch (error) {
        toast.error("Failed to load project")
        router.push("/dashboard/projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.id, reset, router])

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    
    try {
      await updateProject(params.id, data)
      toast.success("Project updated successfully!")
      router.push("/dashboard/projects")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update project")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    
    try {
      await deleteProject(params.id)
      toast.success("Project deleted successfully!")
      router.push("/dashboard/projects")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project")
    } finally {
      setIsDeleting(false)
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

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!project) {
    return null
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Project</h1>
              <p className="text-muted-foreground">Update your project details</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
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
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    {...register("description", {
                      required: "Description is required"
                    })}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    {...register("content")}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    {...register("imageUrl")}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="liveUrl">Live URL</Label>
                    <Input
                      id="liveUrl"
                      {...register("liveUrl")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      {...register("githubUrl")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technology..."
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" onClick={addTechnology}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTechnology(tech)}
                        >
                          {tech}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
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
              </CardContent>
            </Card>
          </div>

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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}