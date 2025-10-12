import { db } from "@/lib/db"
import { sendEmail, emailTemplates, sendBulkEmail } from "@/lib/email"

/**
 * Send weekly digest emails to all users with recent activity
 * Run every Monday at 9:00 AM
 */
export async function sendWeeklyDigests() {
  console.log('Starting weekly digest job...')

  try {
    const users = await db.user.findMany({
      where: {
        emailNotifications: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    console.log(`Processing weekly digests for ${users.length} users`)
    let sentCount = 0

    for (const user of users) {
      if (!user.email || !user.name) continue

      // Calculate stats for the past week
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - 7)

      const [newFollowers, profileViews, likes, comments, messages] = await Promise.all([
        // New followers
        db.follow.count({
          where: {
            followingId: user.id,
            createdAt: { gte: startOfWeek }
          }
        }),

        // Profile views
        db.profileView.count({
          where: {
            userId: user.id,
            createdAt: { gte: startOfWeek }
          }
        }),

        // Likes on user's content
        db.like.count({
          where: {
            createdAt: { gte: startOfWeek },
            OR: [
              { project: { userId: user.id } },
              { post: { userId: user.id } }
            ]
          }
        }),

        // Comments on user's content
        db.comment.count({
          where: {
            createdAt: { gte: startOfWeek },
            OR: [
              { project: { userId: user.id } },
              { post: { userId: user.id } }
            ]
          }
        }),

        // New messages received
        db.message.count({
          where: {
            receiverId: user.id,
            createdAt: { gte: startOfWeek }
          }
        })
      ])

      // Only send digest if there's activity
      if (newFollowers > 0 || profileViews > 0 || likes > 0 || comments > 0 || messages > 0) {
        const stats = {
          newFollowers,
          profileViews,
          likes,
          comments
        }

        const template = emailTemplates.weeklyDigest(
          user.name,
          stats,
          `${process.env.NEXTAUTH_URL}/dashboard`
        )

        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        }).catch(err => {
          console.error(`Failed to send weekly digest to ${user.email}:`, err)
        })

        sentCount++
      }
    }

    console.log(`Weekly digest job completed. Sent ${sentCount} emails.`)
    return { success: true, sent: sentCount, total: users.length }
  } catch (error) {
    console.error('Weekly digest job failed:', error)
    throw error
  }
}

/**
 * Send reminders for pending testimonials
 * Run every 3 days at 10:00 AM
 */
export async function sendTestimonialReminders() {
  console.log('Starting testimonial reminders job...')

  try {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const usersWithPending = await db.user.findMany({
      where: {
        emailNotifications: true,
        testimonialsReceived: {
          some: {
            approved: false,
            createdAt: { lte: threeDaysAgo }
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        testimonialsReceived: {
          where: { approved: false },
          select: { id: true, createdAt: true }
        }
      }
    })

    console.log(`Found ${usersWithPending.length} users with pending testimonials`)
    let sentCount = 0

    for (const user of usersWithPending) {
      if (!user.email || !user.name) continue

      const count = user.testimonialsReceived.length

      if (count > 0) {
        const template = emailTemplates.pendingTestimonialsReminder(
          count,
          `${process.env.NEXTAUTH_URL}/dashboard/testimonials`
        )

        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        }).catch(err => {
          console.error(`Failed to send testimonial reminder to ${user.email}:`, err)
        })

        sentCount++
      }
    }

    console.log(`Testimonial reminders job completed. Sent ${sentCount} emails.`)
    return { success: true, sent: sentCount, total: usersWithPending.length }
  } catch (error) {
    console.error('Testimonial reminders job failed:', error)
    throw error
  }
}

/**
 * Send reminders for incomplete profiles
 * Run daily at 11:00 AM (only sends once per user at 7 days after registration)
 */
export async function sendIncompleteProfileReminders() {
  console.log('Starting incomplete profile reminders job...')

  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

    // Find users who registered exactly 7 days ago
    const users = await db.user.findMany({
      where: {
        emailNotifications: true,
        role: 'developer',
        createdAt: {
          gte: eightDaysAgo,
          lte: sevenDaysAgo
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        skills: true,
        github: true,
        location: true,
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    console.log(`Checking ${users.length} users for incomplete profiles`)
    let sentCount = 0

    for (const user of users) {
      if (!user.email || !user.name) continue

      const missingItems: string[] = []

      if (!user.bio || user.bio.trim() === '') {
        missingItems.push('Add a compelling bio to tell your story')
      }

      if (!user.skills || user.skills.length === 0) {
        missingItems.push('List your technical skills and expertise')
      }

      if (!user.github) {
        missingItems.push('Connect your GitHub account for credibility')
      }

      if (!user.location) {
        missingItems.push('Add your location to help clients find you')
      }

      if (user._count.projects === 0) {
        missingItems.push('Showcase your first project to stand out')
      }

      // Only send reminder if profile is incomplete
      if (missingItems.length >= 2) {
        const template = emailTemplates.incompleteProfileReminder(
          user.name,
          missingItems,
          `${process.env.NEXTAUTH_URL}/dashboard/profile`
        )

        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        }).catch(err => {
          console.error(`Failed to send profile reminder to ${user.email}:`, err)
        })

        sentCount++
      }
    }

    console.log(`Incomplete profile reminders job completed. Sent ${sentCount} emails.`)
    return { success: true, sent: sentCount, total: users.length }
  } catch (error) {
    console.error('Incomplete profile reminders job failed:', error)
    throw error
  }
}

/**
 * Send re-engagement emails to inactive users
 * Run weekly on Thursdays at 2:00 PM
 */
export async function sendReEngagementEmails() {
  console.log('Starting re-engagement emails job...')

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find users who haven't logged in for 30 days
    const inactiveUsers = await db.user.findMany({
      where: {
        emailNotifications: true,
        updatedAt: { lte: thirtyDaysAgo }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      take: 100 // Limit to 100 per run to avoid spam
    })

    console.log(`Found ${inactiveUsers.length} inactive users`)
    let sentCount = 0

    for (const user of inactiveUsers) {
      if (!user.email || !user.name) continue

      // Create custom re-engagement email
      const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`
      const template = {
        subject: `We miss you on DevLink! 👋`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin-bottom: 20px;">We Miss You, ${user.name}! 👋</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                It's been a while since we've seen you on DevLink. We've added some exciting new features and there's a lot happening in the community!
              </p>
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">What's New:</h3>
                <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Enhanced project showcase features</li>
                  <li>New collaboration opportunities</li>
                  <li>Improved messaging system</li>
                  <li>Growing community of developers and clients</li>
                </ul>
              </div>
              <p style="color: #6b7280; margin-top: 15px;">Come back and see what you've been missing!</p>
              <div style="margin-top: 30px;">
                <a href="${dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Return to DevLink</a>
              </div>
            </div>
          </div>
        `
      }

      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
      }).catch(err => {
        console.error(`Failed to send re-engagement email to ${user.email}:`, err)
      })

      sentCount++

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`Re-engagement emails job completed. Sent ${sentCount} emails.`)
    return { success: true, sent: sentCount, total: inactiveUsers.length }
  } catch (error) {
    console.error('Re-engagement emails job failed:', error)
    throw error
  }
}

/**
 * Send notifications about unanswered collaboration requests
 * Run daily at 3:00 PM
 */
export async function sendCollaborationRequestReminders() {
  console.log('Starting collaboration request reminders job...')

  try {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    // Find pending collaboration requests older than 3 days
    const pendingRequests = await db.collaborationRequest.findMany({
      where: {
        status: 'pending',
        createdAt: { lte: threeDaysAgo }
      },
      include: {
        sender: {
          select: { name: true }
        },
        receiver: {
          select: {
            email: true,
            name: true,
            emailNotifications: true
          }
        }
      }
    })

    console.log(`Found ${pendingRequests.length} pending collaboration requests`)
    let sentCount = 0

    for (const request of pendingRequests) {
      if (!request.receiver.email || !request.receiver.emailNotifications) continue
      if (!request.receiver.name || !request.sender.name) continue

      const requestUrl = `${process.env.NEXTAUTH_URL}/dashboard/collaborations`
      const template = {
        subject: `Reminder: Collaboration request from ${request.sender.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin-bottom: 20px;">⏰ Pending Collaboration Request</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                Hi <strong>${request.receiver.name}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                <strong style="color: #3b82f6;">${request.sender.name}</strong> sent you a collaboration request for <strong>"${request.title}"</strong> a few days ago.
              </p>
              <p style="color: #6b7280; margin-top: 10px;">Don't miss this opportunity! Review and respond to the request.</p>
              <div style="margin-top: 30px;">
                <a href="${requestUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Review Request</a>
              </div>
            </div>
          </div>
        `
      }

      await sendEmail({
        to: request.receiver.email,
        subject: template.subject,
        html: template.html
      }).catch(err => {
        console.error(`Failed to send collaboration reminder:`, err)
      })

      sentCount++
    }

    console.log(`Collaboration request reminders job completed. Sent ${sentCount} emails.`)
    return { success: true, sent: sentCount, total: pendingRequests.length }
  } catch (error) {
    console.error('Collaboration request reminders job failed:', error)
    throw error
  }
}
