import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { 
  Plus, 
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  ArrowLeft,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { authOptions } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

async function getUserBlogPosts(userId: string) {
  const { db } = await import("@/lib/db")
  
  return await db.blogPost.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  })
}

export default async function BlogManagePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const posts = await getUserBlogPosts(session.user.id)
  const publishedPosts = posts.filter(post => post.published)
  const draftPosts = posts.filter(post => !post.published)
  
  // Get user data for username
  const { db } = await import("@/lib/db")
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { username: true }
  })

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Blog</h1>
              <p className="text-muted-foreground">
                Manage your articles and drafts ({posts.length} total)
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Link>
            </Button>
          </div>
        </div>

        {posts.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">No articles yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Start sharing your knowledge and insights with the developer community. 
                    Write your first article to get started.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/blog/new">
                    Write Your First Article
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Published Articles */}
            {publishedPosts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Published Articles</h2>
                  <Badge variant="success">{publishedPosts.length}</Badge>
                </div>
                
                <div className="grid gap-4">
                  {publishedPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} username={user?.username || ""} />
                  ))}
                </div>
              </section>
            )}

            {/* Draft Articles */}
            {draftPosts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Edit className="h-5 w-5 text-yellow-600" />
                  <h2 className="text-xl font-semibold">Drafts</h2>
                  <Badge variant="secondary">{draftPosts.length}</Badge>
                </div>
                
                <div className="grid gap-4">
                  {draftPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} username={user?.username || ""} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

interface BlogPostCardProps {
  post: any
  username?: string
}

function BlogPostCard({ post, username }: BlogPostCardProps) {
  return (
    <Card className="card-hover">
      <div className="md:flex">
        {post.imageUrl && (
          <div className="md:w-48 aspect-[2/1] md:aspect-[4/3] relative">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
            />
          </div>
        )}
        
        <div className="flex-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                  <Badge 
                    variant={post.published ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                
                <CardDescription className="line-clamp-2">
                  {post.excerpt}
                </CardDescription>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{post.published ? "Published" : "Updated"} {formatDate(post.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                {post.published && (
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/${username}/blog/${post.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/dashboard/blog/${post.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/blog/${post.id}/edit`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Link>
                </Button>
                
                {post.published && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/${username}/blog/${post.slug}`} target="_blank">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}