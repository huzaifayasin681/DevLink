"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { ProfileFormData, ProjectFormData, BlogPostFormData } from "@/types"
import { generateSlug, calculateReadingTime } from "@/lib/utils"

export async function updateProfile(data: ProfileFormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Check if username is taken by another user
    if (data.username) {
      const existingUser = await db.user.findUnique({
        where: { username: data.username }
      })
      
      if (existingUser && existingUser.id !== session.user.id) {
        throw new Error("Username is already taken")
      }
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        username: data.username,
        bio: data.bio,
        location: data.location,
        website: data.website,
        github: data.github,
        twitter: data.twitter,
        linkedin: data.linkedin,
        skills: data.skills,
        isAvailableForWork: data.isAvailableForWork,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/${data.username}`)
    
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Profile update error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update profile")
  }
}

export async function createProject(data: ProjectFormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const project = await db.project.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl,
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        technologies: data.technologies,
        featured: data.featured,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/projects")
    
    return { success: true, project }
  } catch (error) {
    console.error("Project creation error:", error)
    throw new Error("Failed to create project")
  }
}

export async function updateProject(id: string, data: ProjectFormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Verify project ownership
    const existingProject = await db.project.findUnique({
      where: { id },
    })

    if (!existingProject || existingProject.userId !== session.user.id) {
      throw new Error("Project not found or unauthorized")
    }

    const project = await db.project.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl,
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        technologies: data.technologies,
        featured: data.featured,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/projects")
    
    return { success: true, project }
  } catch (error) {
    console.error("Project update error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update project")
  }
}

export async function deleteProject(id: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Verify project ownership
    const existingProject = await db.project.findUnique({
      where: { id },
    })

    if (!existingProject || existingProject.userId !== session.user.id) {
      throw new Error("Project not found or unauthorized")
    }

    await db.project.delete({
      where: { id },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/projects")
    
    return { success: true }
  } catch (error) {
    console.error("Project deletion error:", error)
    throw new Error("Failed to delete project")
  }
}

export async function createBlogPost(data: BlogPostFormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.title)
    
    // Check if slug is taken
    const existingPost = await db.blogPost.findUnique({
      where: { slug }
    })
    
    if (existingPost) {
      throw new Error("A post with this URL already exists")
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(data.content)

    const post = await db.blogPost.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug,
        published: data.published,
        tags: data.tags,
        imageUrl: data.imageUrl,
        readingTime,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/blog")
    
    return { success: true, post }
  } catch (error) {
    console.error("Blog post creation error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create blog post")
  }
}

export async function updateBlogPost(id: string, data: BlogPostFormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Verify post ownership
    const existingPost = await db.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost || existingPost.userId !== session.user.id) {
      throw new Error("Blog post not found or unauthorized")
    }

    // Generate slug if changed
    const slug = data.slug || generateSlug(data.title)
    
    // Check if slug is taken by another post
    if (slug !== existingPost.slug) {
      const slugTaken = await db.blogPost.findUnique({
        where: { slug }
      })
      
      if (slugTaken && slugTaken.id !== id) {
        throw new Error("A post with this URL already exists")
      }
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(data.content)

    const post = await db.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug,
        published: data.published,
        tags: data.tags,
        imageUrl: data.imageUrl,
        readingTime,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/blog")
    
    return { success: true, post }
  } catch (error) {
    console.error("Blog post update error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update blog post")
  }
}

export async function deleteBlogPost(id: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Verify post ownership
    const existingPost = await db.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost || existingPost.userId !== session.user.id) {
      throw new Error("Blog post not found or unauthorized")
    }

    await db.blogPost.delete({
      where: { id },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/blog")
    
    return { success: true }
  } catch (error) {
    console.error("Blog post deletion error:", error)
    throw new Error("Failed to delete blog post")
  }
}

export async function deleteProfile() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    // Delete all user data in correct order due to foreign key constraints
    await db.blogPost.deleteMany({
      where: { userId: session.user.id },
    })
    
    await db.project.deleteMany({
      where: { userId: session.user.id },
    })
    
    await db.account.deleteMany({
      where: { userId: session.user.id },
    })
    
    await db.session.deleteMany({
      where: { userId: session.user.id },
    })
    
    await db.user.delete({
      where: { id: session.user.id },
    })

    return { success: true }
  } catch (error) {
    console.error("Profile deletion error:", error)
    throw new Error("Failed to delete profile")
  }
}