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
        hourlyRate: data.hourlyRate,
        availableHours: data.availableHours || [],
        emailNotifications: data.emailNotifications,
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

export async function followUser(targetUserId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === targetUserId) {
    throw new Error("Cannot follow yourself")
  }

  try {
    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        user_follow: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    })

    if (existingFollow) {
      throw new Error("Already following this user")
    }

    const follow = await db.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    })

    revalidatePath("/explore")
    return { success: true, follow }
  } catch (error) {
    console.error("Follow user error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to follow user")
  }
}

export async function unfollowUser(targetUserId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const existingFollow = await db.follow.findUnique({
      where: {
        user_follow: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    })

    if (!existingFollow) {
      throw new Error("Not following this user")
    }

    await db.follow.delete({
      where: { id: existingFollow.id }
    })

    revalidatePath("/explore")
    return { success: true }
  } catch (error) {
    console.error("Unfollow user error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to unfollow user")
  }
}

export async function addComment(data: { content: string; projectId?: string; postId?: string }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!data.projectId && !data.postId) {
    throw new Error("Project ID or Post ID required")
  }

  if (data.projectId && data.postId) {
    throw new Error("Cannot comment on both project and post")
  }

  try {
    const comment = await db.comment.create({
      data: {
        content: data.content,
        userId: session.user.id,
        projectId: data.projectId || undefined,
        postId: data.postId || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    if (data.projectId) {
      revalidatePath(`/dashboard/projects/${data.projectId}`)
    } else if (data.postId) {
      revalidatePath(`/dashboard/blog/${data.postId}`)
    }

    return { success: true, comment }
  } catch (error) {
    console.error("Add comment error:", error)
    throw new Error("Failed to add comment")
  }
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const existingComment = await db.comment.findUnique({
      where: { id: commentId }
    })

    if (!existingComment || existingComment.userId !== session.user.id) {
      throw new Error("Comment not found or unauthorized")
    }

    await db.comment.delete({
      where: { id: commentId }
    })

    return { success: true }
  } catch (error) {
    console.error("Delete comment error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete comment")
  }
}

export async function addReview(data: { rating: number; comment: string; userId: string }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === data.userId) {
    throw new Error("Cannot review yourself")
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5")
  }

  try {
    // Check if already reviewed
    const existingReview = await db.review.findUnique({
      where: {
        user_reviewer: {
          userId: data.userId,
          reviewerId: session.user.id
        }
      }
    })

    if (existingReview) {
      // Update existing review
      const review = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: data.rating,
          comment: data.comment
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        }
      })

      return { success: true, review }
    } else {
      // Create new review
      const review = await db.review.create({
        data: {
          rating: data.rating,
          comment: data.comment,
          userId: data.userId,
          reviewerId: session.user.id
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        }
      })

      return { success: true, review }
    }
  } catch (error) {
    console.error("Add review error:", error)
    throw new Error("Failed to add review")
  }
}

export async function trackProfileView(profileUserId: string, ipAddress?: string, userAgent?: string) {
  const session = await getServerSession(authOptions)

  // Don't track views from the profile owner
  if (session?.user?.id === profileUserId) {
    return { success: true }
  }

  try {
    // Create profile view record
    await db.profileView.create({
      data: {
        userId: profileUserId,
        viewerId: session?.user?.id || null,
        ipAddress,
        userAgent
      }
    })

    // Increment profile views count
    await db.user.update({
      where: { id: profileUserId },
      data: {
        profileViews: { increment: 1 }
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Track profile view error:", error)
    // Don't throw error for analytics tracking
    return { success: false }
  }
}

// ============================================
// ENDORSEMENT ACTIONS
// ============================================

export async function giveEndorsement(data: { userId: string; skill: string }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === data.userId) {
    throw new Error("Cannot endorse yourself")
  }

  try {
    // Check if already endorsed this skill
    const existingEndorsement = await db.endorsement.findUnique({
      where: {
        user_endorser_skill: {
          userId: data.userId,
          endorserId: session.user.id,
          skill: data.skill
        }
      }
    })

    if (existingEndorsement) {
      throw new Error("You have already endorsed this skill")
    }

    const endorsement = await db.endorsement.create({
      data: {
        skill: data.skill,
        userId: data.userId,
        endorserId: session.user.id
      },
      include: {
        endorser: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    revalidatePath(`/${data.userId}`)
    return { success: true, endorsement }
  } catch (error) {
    console.error("Give endorsement error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to give endorsement")
  }
}

export async function removeEndorsement(data: { userId: string; skill: string }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const existingEndorsement = await db.endorsement.findUnique({
      where: {
        user_endorser_skill: {
          userId: data.userId,
          endorserId: session.user.id,
          skill: data.skill
        }
      }
    })

    if (!existingEndorsement) {
      throw new Error("Endorsement not found")
    }

    await db.endorsement.delete({
      where: { id: existingEndorsement.id }
    })

    revalidatePath(`/${data.userId}`)
    return { success: true }
  } catch (error) {
    console.error("Remove endorsement error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to remove endorsement")
  }
}

// ============================================
// TESTIMONIAL ACTIONS
// ============================================

export async function addTestimonial(data: {
  userId: string
  content: string
  relationship: string
  companyName?: string
  position?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === data.userId) {
    throw new Error("Cannot give testimonial to yourself")
  }

  try {
    const testimonial = await db.testimonial.create({
      data: {
        content: data.content,
        relationship: data.relationship,
        companyName: data.companyName,
        position: data.position,
        userId: data.userId,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    revalidatePath("/dashboard/testimonials")
    return { success: true, testimonial }
  } catch (error) {
    console.error("Add testimonial error:", error)
    throw new Error("Failed to add testimonial")
  }
}

export async function approveTestimonial(testimonialId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const testimonial = await db.testimonial.findUnique({
      where: { id: testimonialId }
    })

    if (!testimonial || testimonial.userId !== session.user.id) {
      throw new Error("Testimonial not found or unauthorized")
    }

    const updatedTestimonial = await db.testimonial.update({
      where: { id: testimonialId },
      data: { approved: true }
    })

    revalidatePath("/dashboard/testimonials")
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { username: true } })
    if (user?.username) revalidatePath(`/${user.username}`)
    return { success: true, testimonial: updatedTestimonial }
  } catch (error) {
    console.error("Approve testimonial error:", error)
    throw new Error("Failed to approve testimonial")
  }
}

export async function rejectTestimonial(testimonialId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const testimonial = await db.testimonial.findUnique({
      where: { id: testimonialId }
    })

    if (!testimonial || testimonial.userId !== session.user.id) {
      throw new Error("Testimonial not found or unauthorized")
    }

    await db.testimonial.delete({
      where: { id: testimonialId }
    })

    revalidatePath("/dashboard/testimonials")
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { username: true } })
    if (user?.username) revalidatePath(`/${user.username}`)
    return { success: true }
  } catch (error) {
    console.error("Reject testimonial error:", error)
    throw new Error("Failed to reject testimonial")
  }
}

// ============================================
// SERVICE ACTIONS
// ============================================

export async function createService(data: {
  title: string
  description: string
  category: string
  pricing: string
  minPrice?: number
  maxPrice?: number
  duration?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const service = await db.service.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        pricing: data.pricing,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        duration: data.duration,
        userId: session.user.id
      }
    })

    revalidatePath("/dashboard")
    return { success: true, service }
  } catch (error) {
    console.error("Create service error:", error)
    throw new Error("Failed to create service")
  }
}

export async function updateService(id: string, data: {
  title: string
  description: string
  category: string
  pricing: string
  minPrice?: number
  maxPrice?: number
  duration?: string
  active?: boolean
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const existingService = await db.service.findUnique({
      where: { id }
    })

    if (!existingService || existingService.userId !== session.user.id) {
      throw new Error("Service not found or unauthorized")
    }

    const service = await db.service.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        pricing: data.pricing,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        duration: data.duration,
        active: data.active
      }
    })

    revalidatePath("/dashboard")
    return { success: true, service }
  } catch (error) {
    console.error("Update service error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update service")
  }
}

export async function deleteService(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const existingService = await db.service.findUnique({
      where: { id }
    })

    if (!existingService || existingService.userId !== session.user.id) {
      throw new Error("Service not found or unauthorized")
    }

    await db.service.delete({
      where: { id }
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Delete service error:", error)
    throw new Error("Failed to delete service")
  }
}

// ============================================
// MESSAGING ACTIONS
// ============================================

export async function sendMessage(data: {
  receiverId: string
  content: string
  subject?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === data.receiverId) {
    throw new Error("Cannot message yourself")
  }

  try {
    const message = await db.message.create({
      data: {
        content: data.content,
        subject: data.subject,
        senderId: session.user.id,
        receiverId: data.receiverId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    revalidatePath("/dashboard/messages")
    return { success: true, message }
  } catch (error) {
    console.error("Send message error:", error)
    throw new Error("Failed to send message")
  }
}

export async function markMessageAsRead(messageId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const message = await db.message.findUnique({
      where: { id: messageId }
    })

    if (!message || message.receiverId !== session.user.id) {
      throw new Error("Message not found or unauthorized")
    }

    const updatedMessage = await db.message.update({
      where: { id: messageId },
      data: { read: true }
    })

    revalidatePath("/dashboard/messages")
    return { success: true, message: updatedMessage }
  } catch (error) {
    console.error("Mark message as read error:", error)
    throw new Error("Failed to mark message as read")
  }
}

export async function deleteMessage(messageId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const message = await db.message.findUnique({
      where: { id: messageId }
    })

    if (!message || (message.senderId !== session.user.id && message.receiverId !== session.user.id)) {
      throw new Error("Message not found or unauthorized")
    }

    await db.message.delete({
      where: { id: messageId }
    })

    revalidatePath("/dashboard/messages")
    return { success: true }
  } catch (error) {
    console.error("Delete message error:", error)
    throw new Error("Failed to delete message")
  }
}

// ============================================
// COLLABORATION REQUEST ACTIONS
// ============================================

export async function sendCollaborationRequest(data: {
  receiverId: string
  title: string
  description: string
  projectType: string
  budget?: string
  timeline?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === data.receiverId) {
    throw new Error("Cannot send collaboration request to yourself")
  }

  try {
    const request = await db.collaborationRequest.create({
      data: {
        title: data.title,
        description: data.description,
        projectType: data.projectType,
        budget: data.budget,
        timeline: data.timeline,
        senderId: session.user.id,
        receiverId: data.receiverId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    revalidatePath("/dashboard/collaborations")
    return { success: true, request }
  } catch (error) {
    console.error("Send collaboration request error:", error)
    throw new Error("Failed to send collaboration request")
  }
}

export async function acceptCollaborationRequest(requestId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const request = await db.collaborationRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.receiverId !== session.user.id) {
      throw new Error("Collaboration request not found or unauthorized")
    }

    const updatedRequest = await db.collaborationRequest.update({
      where: { id: requestId },
      data: { status: "accepted" }
    })

    revalidatePath("/dashboard/collaborations")
    return { success: true, request: updatedRequest }
  } catch (error) {
    console.error("Accept collaboration request error:", error)
    throw new Error("Failed to accept collaboration request")
  }
}

export async function rejectCollaborationRequest(requestId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const request = await db.collaborationRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.receiverId !== session.user.id) {
      throw new Error("Collaboration request not found or unauthorized")
    }

    const updatedRequest = await db.collaborationRequest.update({
      where: { id: requestId },
      data: { status: "rejected" }
    })

    revalidatePath("/dashboard/collaborations")
    return { success: true, request: updatedRequest }
  } catch (error) {
    console.error("Reject collaboration request error:", error)
    throw new Error("Failed to reject collaboration request")
  }
}