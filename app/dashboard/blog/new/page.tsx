"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { ArrowLeft, Save, Eye, Plus, X, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/main-layout"
import { BlogPostFormData } from "@/types"
import { createBlogPost } from "@/lib/actions"
import { validateUrl, generateSlug } from "@/lib/utils"
import toast from "react-hot-toast"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const defaultValues: BlogPostFormData = {
  title: "",
  content: "",
  excerpt: "",
  slug: "",
  published: false,
  tags: [],
  imageUrl: "",
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [activeTab, setActiveTab] = useState("write")

  // Show AI feature toast on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      toast(
        "📝 AI Blog Assistant: Generate outlines, improve content, and auto-create tags!",
        {
          icon: "✨",
          duration: 5000,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          },
        }
      )
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<BlogPostFormData>({
    defaultValues,
  })

  const tags = watch("tags") || []
  const title = watch("title")
  const content = watch("content")
  const slug = watch("slug")

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setValue("title", newTitle, { shouldDirty: true })
    
    if (!slug || slug === generateSlug(title)) {
      setValue("slug", generateSlug(newTitle), { shouldDirty: true })
    }
  }

  const onSubmit = async (data: BlogPostFormData) => {
    setIsLoading(true)
    
    try {
      await createBlogPost(data)
      toast.success(`Article ${data.published ? 'published' : 'saved as draft'} successfully!`)
      router.push("/dashboard/blog")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create blog post")
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue("tags", [...tags, newTag.trim()], { shouldDirty: true })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue("tags", tags.filter(tag => tag !== tagToRemove), { shouldDirty: true })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const generateOutline = async () => {
    const topic = watch("title")
    if (!topic) {
      toast.error("Please enter a title/topic first")
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch("/api/ai/blog-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-outline", topic }),
      })

      if (!res.ok) throw new Error("Failed to generate")

      const data = await res.json()
      setValue("title", data.title, { shouldDirty: true })
      setValue("excerpt", data.metaDescription, { shouldDirty: true })
      
      const outlineContent = `${data.introduction}\n\n${data.sections.map((s: any) => 
        `## ${s.heading}\n\n${s.points.map((p: string) => `- ${p}`).join("\n")}`
      ).join("\n\n")}\n\n${data.conclusion}`
      
      setValue("content", outlineContent, { shouldDirty: true })
      setValue("tags", data.tags, { shouldDirty: true })
      toast.success("Outline generated! Edit and expand it.")
    } catch (error) {
      toast.error("Failed to generate outline")
    } finally {
      setIsGenerating(false)
    }
  }

  const improveContent = async () => {
    const currentContent = watch("content")
    const currentTitle = watch("title")
    
    if (!currentContent || !currentTitle) {
      toast.error("Please add title and content first")
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch("/api/ai/blog-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "improve-content", 
          title: currentTitle,
          content: currentContent 
        }),
      })

      if (!res.ok) throw new Error("Failed to improve")

      const data = await res.json()
      setValue("content", data.content, { shouldDirty: true })
      toast.success("Content improved!")
    } catch (error) {
      toast.error("Failed to improve content")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateTags = async () => {
    const currentContent = watch("content")
    const currentTitle = watch("title")
    
    if (!currentContent || !currentTitle) {
      toast.error("Please add title and content first")
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch("/api/ai/blog-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "generate-tags", 
          title: currentTitle,
          content: currentContent 
        }),
      })

      if (!res.ok) throw new Error("Failed to generate")

      const data = await res.json()
      setValue("tags", data.tags, { shouldDirty: true })
      toast.success("Tags generated!")
    } catch (error) {
      toast.error("Failed to generate tags")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Write New Article</h1>
              <p className="text-muted-foreground">Share your knowledge with the developer community</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setValue("published", false, { shouldDirty: true })}
                disabled={isLoading}
              >
                Save Draft
              </Button>
              <Button 
                type="submit"
                form="blog-post-form"
                onClick={() => setValue("published", true, { shouldDirty: true })}
                disabled={isLoading}
              >
                {isLoading ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <form id="blog-post-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle>Article Details</CardTitle>
                  <CardDescription>
                    Basic information about your article
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title">Title *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateOutline}
                        disabled={isGenerating || !watch("title")}
                      >
                        {isGenerating ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-2" />
                        )}
                        Generate Outline
                      </Button>
                    </div>
                    <Input
                      id="title"
                      {...register("title", { 
                        required: "Title is required",
                        minLength: { value: 5, message: "Title must be at least 5 characters" }
                      })}
                      placeholder="Enter your article title"
                      onChange={handleTitleChange}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      {...register("excerpt", {
                        maxLength: { value: 300, message: "Excerpt must be less than 300 characters" }
                      })}
                      placeholder="Brief summary of your article..."
                      rows={3}
                    />
                    {errors.excerpt && (
                      <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {watch("excerpt")?.length || 0}/300 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      {...register("slug", {
                        required: "URL slug is required",
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message: "Slug can only contain lowercase letters, numbers, and hyphens"
                        }
                      })}
                      placeholder="article-url-slug"
                    />
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Article will be available at: /your-username/blog/{slug || "article-slug"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Article Content</CardTitle>
                      <CardDescription>
                        Write your article using Markdown syntax
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={improveContent}
                      disabled={isGenerating || !watch("content")}
                    >
                      {isGenerating ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      ) : (
                        <Wand2 className="h-3 w-3 mr-2" />
                      )}
                      Improve
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="write" className="mt-4">
                      <Textarea
                        {...register("content", {
                          required: "Content is required",
                          minLength: { value: 100, message: "Content must be at least 100 characters" }
                        })}
                        placeholder="# Your Article Title

Write your article content here using Markdown syntax...

## Subheading

- List item 1
- List item 2

```javascript
// Code example
const example = 'Hello, world!';
```

**Bold text** and *italic text* are supported.

[Link text](https://example.com)"
                        rows={20}
                        className="font-mono text-sm"
                      />
                      {errors.content && (
                        <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md min-h-[500px]">
                        {content ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Start writing to see a preview of your article...
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Publishing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={watch("published")}
                      onCheckedChange={(checked) => 
                        setValue("published", checked, { shouldDirty: true })
                      }
                    />
                    <Label htmlFor="published">Publish article</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {watch("published") 
                      ? "Article will be published and visible to everyone"
                      : "Article will be saved as a draft"
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tags</CardTitle>
                      <CardDescription>
                        Add tags to help readers find your article
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateTags}
                      disabled={isGenerating || !watch("content")}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeTag(tag)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}

                    {tags.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No tags added yet. Add relevant tags like "React", "JavaScript", etc.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                  <CardDescription>
                    Add a cover image for your article
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input
                      {...register("imageUrl", {
                        validate: (value) => !value || validateUrl(value) || "Please enter a valid image URL"
                      })}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.imageUrl && (
                      <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Optional: URL to a cover image for your article
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Article Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Article Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Words</span>
                    <span>{content ? content.split(/\s+/).length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Characters</span>
                    <span>{content?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Reading Time</span>
                    <span>{Math.ceil((content?.split(/\s+/).length || 0) / 200)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tags</span>
                    <span>{tags.length}</span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}