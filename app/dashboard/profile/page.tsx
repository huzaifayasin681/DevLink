"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { User, ArrowLeft, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { ProfileFormData } from "@/types"
import { updateProfile, deleteProfile } from "@/lib/actions"
import { validateUsername, validateUrl } from "@/lib/utils"
import toast from "react-hot-toast"
import Link from "next/link"
import { signOut } from "next-auth/react"



export default function ProfileEditPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingBio, setIsGeneratingBio] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [userData, setUserData] = useState<ProfileFormData | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [bioOptions, setBioOptions] = useState<{short: string, medium: string, long: string} | null>(null)

  // Show AI feature toast on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      toast(
        "🤖 AI Bio Generator: Click 'AI Generate' to create a professional bio from your GitHub!",
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

  const skillSuggestions = [
    "JavaScript", "TypeScript", "Python", "Java", "React", "Node.js", "Next.js", "Vue.js", "Angular", "MongoDB", "PostgreSQL", "MySQL", "AWS", "Docker", "Kubernetes", "Git", "HTML", "CSS", "Tailwind CSS", "Express.js", "Django", "Flask", "Spring Boot", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Flutter", "React Native", "Firebase", "GraphQL", "REST API", "Redis", "Elasticsearch", "Jenkins", "GitHub Actions", "TensorFlow", "PyTorch", "Machine Learning", "DevOps", "Microservices", "Agile", "Scrum", "Jest", "Cypress", "Figma"
  ]

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    getValues,
    reset,
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
      isAvailableForWork: false,
      hourlyRate: undefined,
      availableHours: [],
      emailNotifications: true,
    },
  })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id && !userData) {
        try {
          const response = await fetch(`/api/users?current=true`)
          if (response.ok) {
            const data = await response.json()
            const user = data.user
            const formData: ProfileFormData = {
              name: user.name || "",
              username: user.username || "",
              bio: user.bio || "",
              location: user.location || "",
              website: user.website || "",
              github: user.github || "",
              twitter: user.twitter || "",
              linkedin: user.linkedin || "",
              skills: user.skills || [],
              isAvailableForWork: user.isAvailableForWork || false,
              hourlyRate: user.hourlyRate || undefined,
              availableHours: user.availableHours || [],
              emailNotifications: user.emailNotifications ?? true,
            }
            setUserData(formData)
            reset(formData)
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          toast.error('Failed to load profile data')
        }
      }
    }

    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [session, status, reset, userData])

  const skills = watch("skills") || []
  
  const filteredSuggestions = useMemo(() => {
    if (!newSkill.trim()) return []
    return skillSuggestions
      .filter(skill => 
        skill.toLowerCase().includes(newSkill.toLowerCase()) && 
        !skills.includes(skill)
      )
      .slice(0, 8)
  }, [newSkill, skills])

  if (status === 'loading' || !userData) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    
    try {
      await updateProfile(data)
      toast.success("Profile updated successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = (skill?: string) => {
    const skillToAdd = skill || newSkill.trim()
    if (skillToAdd && !skills.includes(skillToAdd)) {
      setValue("skills", [...skills, skillToAdd], { shouldDirty: true })
      setNewSkill("")
      setShowSuggestions(false)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setValue("skills", skills.filter(skill => skill !== skillToRemove), { shouldDirty: true })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  const handleDeleteProfile = async () => {
    setIsDeleting(true)
    
    try {
      await deleteProfile()
      toast.success("Profile deleted successfully")
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete profile")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const generateBio = async () => {
    const githubUrl = watch("github")
    const githubUsername = githubUrl?.split("github.com/")[1]?.split("/")[0]

    setIsGeneratingBio(true)
    try {
      const res = await fetch("/api/ai/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUsername }),
      })

      if (!res.ok) throw new Error("Failed to generate")

      const data = await res.json()
      setBioOptions(data)
      if (data.suggestedSkills?.length > 0) {
        const currentSkills = watch("skills") || []
        const newSkills = [...new Set([...currentSkills, ...data.suggestedSkills])]
        setValue("skills", newSkills, { shouldDirty: true })
      }
      toast.success("Bio generated! Choose a version below.")
    } catch (error) {
      toast.error("Failed to generate bio")
    } finally {
      setIsGeneratingBio(false)
    }
  }

  const selectBio = (bioText: string) => {
    setValue("bio", bioText, { shouldDirty: true })
    setBioOptions(null)
    toast.success("Bio applied!")
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-muted-foreground">Update your developer profile information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  This information will be displayed on your public profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name", { 
                        required: "Name is required",
                        minLength: { value: 2, message: "Name must be at least 2 characters" }
                      })}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      {...register("username", {
                        required: "Username is required",
                        validate: (value) => validateUsername(value) || "Username must be 3-20 characters, alphanumeric and underscores only"
                      })}
                      placeholder="Enter your username"
                    />
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Your profile will be available at: devlink.com/{watch("username") || "username"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Bio</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateBio}
                      disabled={isGeneratingBio}
                    >
                      {isGeneratingBio ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-2" />
                      )}
                      {isGeneratingBio ? "Generating..." : "AI Generate"}
                    </Button>
                  </div>
                  <Textarea
                    id="bio"
                    {...register("bio", {
                      maxLength: { value: 5000, message: "Bio must be less than 5000 characters" }
                    })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {watch("bio")?.length || 0}/5000 characters
                  </p>
                  {bioOptions && (
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Choose a bio version:</p>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => selectBio(bioOptions.short)}
                          className="w-full text-left p-2 text-sm bg-background hover:bg-accent rounded border"
                        >
                          <span className="font-medium">Short:</span> {bioOptions.short}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBio(bioOptions.medium)}
                          className="w-full text-left p-2 text-sm bg-background hover:bg-accent rounded border"
                        >
                          <span className="font-medium">Medium:</span> {bioOptions.medium}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBio(bioOptions.long)}
                          className="w-full text-left p-2 text-sm bg-background hover:bg-accent rounded border"
                        >
                          <span className="font-medium">Long:</span> {bioOptions.long}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Connect your social profiles and portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...register("website", {
                      validate: (value) => !value || validateUrl(value) || "Please enter a valid URL"
                    })}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      {...register("github", {
                        validate: (value) => !value || validateUrl(value) || "Please enter a valid GitHub URL"
                      })}
                      placeholder="https://github.com/username"
                    />
                    {errors.github && (
                      <p className="text-sm text-destructive">{errors.github.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      {...register("twitter", {
                        validate: (value) => !value || validateUrl(value) || "Please enter a valid Twitter URL"
                      })}
                      placeholder="https://twitter.com/username"
                    />
                    {errors.twitter && (
                      <p className="text-sm text-destructive">{errors.twitter.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    {...register("linkedin", {
                      validate: (value) => !value || validateUrl(value) || "Please enter a valid LinkedIn URL"
                    })}
                    placeholder="https://linkedin.com/in/username"
                  />
                  {errors.linkedin && (
                    <p className="text-sm text-destructive">{errors.linkedin.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Technologies</CardTitle>
                <CardDescription>
                  Add your technical skills and areas of expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Add a skill..."
                          value={newSkill}
                          onChange={(e) => {
                            setNewSkill(e.target.value)
                            setShowSuggestions(e.target.value.length > 0)
                          }}
                          onKeyPress={handleKeyPress}
                          onFocus={() => setShowSuggestions(newSkill.length > 0)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredSuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                                onClick={() => addSkill(suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button type="button" onClick={() => addSkill()} disabled={!newSkill.trim()}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet. Add some skills to showcase your expertise.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Work Availability & Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Manage your work availability and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="available"
                    checked={watch("isAvailableForWork")}
                    onCheckedChange={(checked) =>
                      setValue("isAvailableForWork", checked, { shouldDirty: true })
                    }
                  />
                  <Label htmlFor="available" className="whitespace-nowrap">Available for work</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  This will show a badge on your profile indicating you're open to new opportunities
                </p>

                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    {...register("hourlyRate", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Rate must be positive" }
                    })}
                    placeholder="e.g., 50"
                  />
                  {errors.hourlyRate && (
                    <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your standard hourly rate for freelance work
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="availableHours">Availability</Label>
                  <Input
                    id="availableHours"
                    {...register("availableHours")}
                    placeholder="e.g., Weekdays 9-5 PST, Evenings"
                  />
                  <p className="text-xs text-muted-foreground">
                    When are you typically available for work?
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2 border-t">
                  <Switch
                    id="emailNotifications"
                    checked={watch("emailNotifications")}
                    onCheckedChange={(checked) =>
                      setValue("emailNotifications", checked, { shouldDirty: true })
                    }
                  />
                  <Label htmlFor="emailNotifications" className="whitespace-nowrap">Email notifications</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for new followers, likes, and comments
                </p>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">Danger Zone</CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showDeleteConfirm ? (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Profile
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. This will permanently delete your profile, 
                      projects, blog posts, and all associated data.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={handleDeleteProfile}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete My Profile"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" asChild className="rounded-lg">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-lg">
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