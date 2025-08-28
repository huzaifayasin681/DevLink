import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { formatDate, getInitials } from "@/lib/utils"

interface BlogPageProps {
  params: {
    username: string
  }
}

async function getProfileWithPosts(username: string) {
  const { db } = await import("@/lib/db")
  
  const user = await db.user.findUnique({
    where: { username },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  return user
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const profile = await getProfileWithPosts(params.username)
  
  if (!profile) {
    return {
      title: "Blog Not Found | DevLink"
    }
  }

  return {
    title: `${profile.name}'s Blog | DevLink`,
    description: `Read articles and insights from ${profile.name}, covering topics in software development, programming, and technology.`,
    openGraph: {
      title: `${profile.name}'s Blog`,
      description: `Articles and insights from ${profile.name}`,
      type: "website",
      images: [
        {
          url: profile.image || "",
          width: 400,
          height: 400,
          alt: `${profile.name}'s profile picture`,
        },
      ],
    },
  }
}

export default async function UserBlogPage({ params }: BlogPageProps) {
  const profile = await getProfileWithPosts(params.username)

  if (!profile) {
    notFound()
  }

  const publishedPosts = profile.posts
  const tagSet = new Set(publishedPosts.flatMap(post => post.tags))
  const allTags = Array.from(tagSet)

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/${profile.username}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.image || ""} alt={profile.name || ""} />
              <AvatarFallback className="text-lg">{getInitials(profile.name || "")}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{profile.name}'s Blog</h1>
              <p className="text-muted-foreground">{publishedPosts.length} articles published</p>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mr-2" />
              {allTags.slice(0, 8).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {allTags.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{allTags.length - 8} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Blog Posts */}
        {publishedPosts.length > 0 ? (
          <div className="grid gap-8">
            {publishedPosts.map((post) => (
              <Card key={post.id} className="card-hover overflow-hidden">
                <div className="md:flex">
                  {post.imageUrl && (
                    <div className="md:w-80 aspect-[2/1] md:aspect-[4/3] relative">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        <Link 
                          href={`/${profile.username}/blog/${post.slug}`}
                          className="hover:underline"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readingTime} min read</span>
                        </div>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 4).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 4} more
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/${profile.username}/blog/${post.slug}`}>
                          Read Article
                        </Link>
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Tag className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">No articles yet</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.name} hasn't published any articles yet.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/${profile.username}`}>
                    Back to Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}