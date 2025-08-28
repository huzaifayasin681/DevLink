"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { User, ArrowLeft, Save } from "lucide-react"
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [userData, setUserData] = useState<ProfileFormData | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const skillSuggestions = [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB", "Perl", "Lua", "Haskell", "Clojure",
    // Frontend
    "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "HTML", "CSS", "SASS", "SCSS", "Tailwind CSS", "Bootstrap", "Material-UI", "Chakra UI", "Styled Components", "Emotion", "jQuery", "Alpine.js",
    // Backend
    "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails", "Gin", "Echo", "Fiber", "NestJS", "Koa.js", "Hapi.js",
    // Databases
    "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Elasticsearch", "Cassandra", "DynamoDB", "Firebase", "Supabase", "PlanetScale", "CockroachDB", "Neo4j", "InfluxDB",
    // Cloud & DevOps
    "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "Terraform", "Ansible", "Chef", "Puppet", "Vagrant", "Nginx", "Apache",
    // Mobile
    "React Native", "Flutter", "iOS", "Android", "Xamarin", "Ionic", "Cordova", "Unity", "Unreal Engine",
    // Data Science & AI
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Jupyter", "Apache Spark", "Hadoop", "Kafka", "Airflow", "MLflow", "Kubeflow",
    // Testing
    "Jest", "Cypress", "Selenium", "Playwright", "Puppeteer", "Mocha", "Chai", "Jasmine", "PHPUnit", "JUnit", "pytest", "RSpec",
    // Tools & Others
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Slack", "Discord", "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "Blender", "Maya", "3ds Max",
    // Methodologies
    "Agile", "Scrum", "Kanban", "DevOps", "CI/CD", "TDD", "BDD", "Microservices", "REST API", "GraphQL", "gRPC", "WebSockets", "OAuth", "JWT", "SOLID Principles", "Design Patterns"
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
    },
  })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
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
            }
            setUserData(formData)
            reset(formData)
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
        }
      }
    }

    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [session, status, reset])

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

  const skills = watch("skills") || []

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

  const filteredSuggestions = skillSuggestions
    .filter(skill => 
      skill.toLowerCase().includes(newSkill.toLowerCase()) && 
      !skills.includes(skill)
    )
    .slice(0, 8)

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
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...register("bio", {
                      maxLength: { value: 500, message: "Bio must be less than 500 characters" }
                    })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {watch("bio")?.length || 0}/500 characters
                  </p>
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

            {/* Work Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Work Availability</CardTitle>
                <CardDescription>
                  Let others know if you're open to new opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                <p className="text-xs text-muted-foreground mt-2">
                  This will show a badge on your profile indicating you're open to new opportunities
                </p>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
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
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
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