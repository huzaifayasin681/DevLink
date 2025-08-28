"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { updateProfile } from "@/lib/actions"
import { validateUsername } from "@/lib/utils"
import { ProfileFormData } from "@/types"
import toast from "react-hot-toast"
import { X, Plus, CheckCircle } from "lucide-react"
import { DevLinkLogo } from "@/components/devlink-logo"

const commonSkills = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "Go", "Rust",
  "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Express.js", "FastAPI",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "GraphQL", "REST API",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
  "Git", "GitHub", "GitLab", "CI/CD", "Jest", "Cypress"
]

export default function SetupPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [usernameError, setUsernameError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      location: "",
      website: "",
      github: "",
      twitter: "",
      linkedin: "",
      skills: [],
      isAvailableForWork: false
    }
  })

  const watchedUsername = watch("username")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }

    // Pre-fill form with session data
    if (session.user) {
      setValue("name", session.user.name || "")
      setValue("username", session.user.username || "")
      // If user already has a username, redirect to dashboard
      if (session.user.username) {
        router.push("/dashboard")
      }
    }
  }, [session, status, router, setValue])

  useEffect(() => {
    if (watchedUsername && watchedUsername.length >= 3) {
      if (!validateUsername(watchedUsername)) {
        setUsernameError("Username must be 3-20 characters, letters, numbers, and underscores only")
      } else {
        setUsernameError("")
      }
    } else if (watchedUsername) {
      setUsernameError("Username must be at least 3 characters")
    } else {
      setUsernameError("")
    }
  }, [watchedUsername])

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim()
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const newSkills = [...skills, trimmedSkill]
      setSkills(newSkills)
      setValue("skills", newSkills)
    }
    setNewSkill("")
  }

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove)
    setSkills(newSkills)
    setValue("skills", newSkills)
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (usernameError) {
      toast.error("Please fix the username error")
      return
    }

    setIsLoading(true)
    try {
      await updateProfile({ ...data, skills })
      await update() // Refresh session
      toast.success("Profile setup completed!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container max-w-2xl py-12">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <DevLinkLogo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Let's set up your developer profile so others can discover your work
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be displayed on your public profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...register("username", { 
                      required: "Username is required",
                      validate: (value) => validateUsername(value) || "Invalid username format"
                    })}
                    placeholder="johndoe"
                  />
                  {(errors.username || usernameError) && (
                    <p className="text-sm text-red-500">
                      {errors.username?.message || usernameError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This will be your profile URL: devlink.com/{watchedUsername || "username"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  A good bio helps others understand your background and interests
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="San Francisco, CA"
                />
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <div>
                  <Label>Skills</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add your technical skills to help others find you
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill(newSkill)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSkill(newSkill)}
                    disabled={!newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Common Skills */}
                <div>
                  <p className="text-sm font-medium mb-2">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSkills.filter(skill => !skills.includes(skill)).slice(0, 12).map((skill) => (
                      <Button
                        key={skill}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSkill(skill)}
                        className="text-xs"
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Selected Skills */}
                {skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Your skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <Label>Social Links (Optional)</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      {...register("github")}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      {...register("twitter")}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      {...register("linkedin")}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="available">Available for Work</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others know if you're open to new opportunities
                  </p>
                </div>
                <Switch
                  id="available"
                  {...register("isAvailableForWork")}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}