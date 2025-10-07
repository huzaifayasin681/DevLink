import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Twitter,
  Linkedin,
  Github,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainLayout } from "@/components/main-layout"
import { LikeButton } from "@/components/like-button"
import { CommentsSection } from "@/components/comments-section"
import { ProfileViewTracker } from "@/components/profile-view-tracker"
import { formatDate, getInitials } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface BlogPostPageProps {
  params: {
    username: string
    slug: string
  }
}

async function getBlogPost(username: string, slug: string, currentUserId?: string) {
  const { db } = await import("@/lib/db")
  
  // First verify the user exists
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true }
  })
  
  if (!user) {
    return null
  }
  
  // Get the blog post
  const post = await db.blogPost.findFirst({
    where: {
      slug,
      userId: user.id,
      published: true
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          github: true,
          twitter: true,
          linkedin: true
        }
      }
    }
  })
  
  if (!post) {
    return null
  }

  // Check if current user liked this post
  let isLiked = false
  if (currentUserId) {
    const like = await db.like.findFirst({
      where: {
        userId: currentUserId,
        postId: post.id
      }
    })
    isLiked = !!like
  }
  
  return {
    post: { ...post, isLiked },
    author: post.user
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const data = await getBlogPost(params.username, params.slug)
  
  if (!data) {
    return {
      title: "Post Not Found | DevLink"
    }
  }

  const { post, author } = data

  return {
    title: `${post.title} | ${author.name || ""}`,
    description: post.excerpt,
    authors: [{ name: author.name || "" }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [author.name || ""],
      images: [
        {
          url: post.imageUrl || author.image || "",
          width: 800,
          height: 400,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.imageUrl || author.image || ""],
      creator: `@${author.username}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const session = await getServerSession(authOptions)
  const data = await getBlogPost(params.username, params.slug, session?.user?.id)

  if (!data) {
    notFound()
  }

  const { post, author } = data
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://devlink.vercel.app'}/${params.username}/blog/${params.slug}`

  return (
    <MainLayout>
      <article className="container max-w-4xl py-8">
        {/* Back Navigation */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href={`/${author.username}/blog`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {author.name}'s Blog
          </Link>
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          {post.imageUrl && (
            <div className="aspect-video relative mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Link href={`/${author.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={author.image || ""} alt={author.name || ""} />
                    <AvatarFallback>{getInitials(author.name || "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{author.name}</p>
                    <p className="text-sm text-muted-foreground">@{author.username}</p>
                  </div>
                </Link>
                
                <div className="h-8 w-px bg-border" />
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readingTime} min read</span>
                  </div>
                  <LikeButton 
                    postId={post.id}
                    initialLiked={(post as any).isLiked}
                    initialCount={post.likesCount}
                    size="sm"
                  />
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}&via=${author.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Share
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link 
                    href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    Share
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-medium mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="text-base leading-7 mb-4">{children}</p>,
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !className || !className.startsWith('language-')
                return !isInline && match ? (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                )
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => (
                <Link 
                  href={href || '#'} 
                  className="text-primary hover:underline"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                  {href?.startsWith('http') && <ExternalLink className="inline h-3 w-3 ml-1" />}
                </Link>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Author Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={author.image || ""} alt={author.name || ""} />
                <AvatarFallback className="text-lg">{getInitials(author.name || "")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="mb-2">
                  <Link href={`/${author.username}`} className="hover:underline">
                    {author.name}
                  </Link>
                </CardTitle>
                <p className="text-muted-foreground mb-3">{author.bio || "Developer and writer"}</p>
                <div className="flex gap-3">
                  {author.github && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={author.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Link>
                    </Button>
                  )}
                  {author.twitter && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={author.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <Link href={`/${author.username}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="pt-6">
            <CommentsSection postId={post.id} />
          </CardContent>
        </Card>

        {/* Navigation */}
        <section className="flex justify-between items-center mt-8">
          <Button variant="outline" asChild>
            <Link href={`/${author.username}/blog`}>
              View More Articles
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${author.username}`}>
              View Profile
            </Link>
          </Button>
        </section>
      </article>
      <ProfileViewTracker userId={author.id} />
    </MainLayout>
  )
}