import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    console.log('Attempting to send email to:', to)
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.FROM_EMAIL
    })
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    })
    console.log('Email sent successfully to:', to)
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

// Helper function to send emails to multiple recipients
export async function sendBulkEmail(recipients: Array<{ email: string; name: string }>, template: { subject: string; html: string }) {
  const promises = recipients.map(recipient =>
    sendEmail({
      to: recipient.email,
      subject: template.subject,
      html: template.html
    }).catch(err => console.error(`Failed to send email to ${recipient.email}:`, err))
  )

  await Promise.allSettled(promises)
}

// Helper function to notify all followers
export async function notifyFollowers(userId: string, template: { subject: string; html: string }) {
  const { db } = await import("@/lib/db")

  try {
    const followers = await db.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            email: true,
            name: true,
            emailNotifications: true
          }
        }
      }
    })

    const recipients = followers
      .filter(f => f.follower.email && f.follower.emailNotifications && f.follower.name)
      .map(f => ({ email: f.follower.email!, name: f.follower.name! }))

    if (recipients.length > 0) {
      await sendBulkEmail(recipients, template)
    }
  } catch (error) {
    console.error('Error notifying followers:', error)
  }
}

// Helper function to check and send milestone notifications
export async function checkAndNotifyMilestone(userId: string, metricType: 'followers' | 'profileViews' | 'projects' | 'posts', currentCount: number) {
  const { db } = await import("@/lib/db")

  const milestones: { [key: string]: number[] } = {
    followers: [1, 10, 50, 100, 500, 1000],
    profileViews: [100, 500, 1000, 5000, 10000],
    projects: [1, 5, 10, 25],
    posts: [1, 5, 10, 25]
  }

  const milestoneValues = milestones[metricType]
  const milestone = milestoneValues.find(m => m === currentCount)

  if (milestone) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          emailNotifications: true,
          username: true
        }
      })

      if (user?.email && user.emailNotifications && user.name) {
        const milestoneDescriptions: { [key: string]: string } = {
          followers: `You now have ${milestone} follower${milestone > 1 ? 's' : ''}!`,
          profileViews: `Your profile has been viewed ${milestone.toLocaleString()} times!`,
          projects: `You've showcased ${milestone} project${milestone > 1 ? 's' : ''}!`,
          posts: `You've published ${milestone} blog post${milestone > 1 ? 's' : ''}!`
        }

        const milestoneNames: { [key: string]: string } = {
          followers: `${milestone} Follower${milestone > 1 ? 's' : ''}`,
          profileViews: `${milestone.toLocaleString()} Profile Views`,
          projects: `${milestone} Project${milestone > 1 ? 's' : ''}`,
          posts: `${milestone} Blog Post${milestone > 1 ? 's' : ''}`
        }

        const profileUrl = `${process.env.NEXTAUTH_URL}/${user.username || userId}`
        const template = emailTemplates.milestoneAchieved(
          user.name,
          milestoneNames[metricType],
          milestoneDescriptions[metricType],
          profileUrl
        )

        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        }).catch(err => console.error('Failed to send milestone notification:', err))
      }
    } catch (error) {
      console.error('Error checking milestone:', error)
    }
  }
}

export const emailTemplates = {
  newFollower: (followerName: string, profileUrl: string) => ({
    subject: `${followerName} started following you on DevLink`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Follower!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${followerName}</strong> started following you on DevLink.
          </p>
          <div style="margin-top: 30px;">
            <a href="${profileUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Profile</a>
          </div>
        </div>
      </div>
    `,
  }),

  newLike: (likerName: string, itemTitle: string, itemUrl: string, itemType: string) => ({
    subject: `${likerName} liked your ${itemType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Like!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${likerName}</strong> liked your ${itemType} <strong>"${itemTitle}"</strong>.
          </p>
          <div style="margin-top: 30px;">
            <a href="${itemUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View ${itemType}</a>
          </div>
        </div>
      </div>
    `,
  }),

  newComment: (commenterName: string, itemTitle: string, comment: string, itemUrl: string, itemType: string) => ({
    subject: `${commenterName} commented on your ${itemType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Comment!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${commenterName}</strong> commented on your ${itemType} <strong>"${itemTitle}"</strong>:
          </p>
          <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 20px 0; color: #6b7280; font-style: italic;">${comment}</blockquote>
          <div style="margin-top: 30px;">
            <a href="${itemUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Comment</a>
          </div>
        </div>
      </div>
    `,
  }),

  newMessage: (senderName: string, subject: string, messagePreview: string, messagesUrl: string) => ({
    subject: `New message from ${senderName} on DevLink`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Message!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            You received a new message from <strong style="color: #3b82f6;">${senderName}</strong>
          </p>
          ${subject ? `<p style="color: #4b5563; margin-top: 10px;"><strong>Subject:</strong> ${subject}</p>` : ''}
          <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 20px 0; color: #6b7280; font-style: italic;">${messagePreview}</blockquote>
          <div style="margin-top: 30px;">
            <a href="${messagesUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Read Message</a>
          </div>
        </div>
      </div>
    `,
  }),

  collaborationRequest: (senderName: string, title: string, description: string, requestUrl: string) => ({
    subject: `New collaboration request from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Collaboration Request!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${senderName}</strong> wants to collaborate with you on:
          </p>
          <h3 style="color: #1f2937; margin: 20px 0 10px;">${title}</h3>
          <p style="color: #6b7280; line-height: 1.6;">${description}</p>
          <div style="margin-top: 30px;">
            <a href="${requestUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Request</a>
          </div>
        </div>
      </div>
    `,
  }),

  collaborationAccepted: (receiverName: string, title: string, dashboardUrl: string) => ({
    subject: `${receiverName} accepted your collaboration request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">Request Accepted!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Great news! <strong style="color: #3b82f6;">${receiverName}</strong> accepted your collaboration request for <strong>"${title}"</strong>.
          </p>
          <div style="margin-top: 30px;">
            <a href="${dashboardUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Details</a>
          </div>
        </div>
      </div>
    `,
  }),

  collaborationRejected: (receiverName: string, title: string, dashboardUrl: string) => ({
    subject: `Update on your collaboration request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Request Update</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${receiverName}</strong> declined your collaboration request for <strong>"${title}"</strong>.
          </p>
          <p style="color: #6b7280; margin-top: 10px;">Don't worry! Keep exploring other opportunities.</p>
          <div style="margin-top: 30px;">
            <a href="${dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Explore Developers</a>
          </div>
        </div>
      </div>
    `,
  }),

  newTestimonial: (authorName: string, relationship: string, testimonialUrl: string) => ({
    subject: `${authorName} wrote a testimonial for you`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Testimonial!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${authorName}</strong> (${relationship}) wrote a testimonial for you on DevLink.
          </p>
          <p style="color: #6b7280; margin-top: 10px;">Review and approve it to display on your profile.</p>
          <div style="margin-top: 30px;">
            <a href="${testimonialUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Review Testimonial</a>
          </div>
        </div>
      </div>
    `,
  }),

  testimonialApproved: (userName: string, profileUrl: string) => ({
    subject: `${userName} approved your testimonial`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">Testimonial Approved!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${userName}</strong> approved your testimonial. It's now visible on their profile!
          </p>
          <div style="margin-top: 30px;">
            <a href="${profileUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Profile</a>
          </div>
        </div>
      </div>
    `,
  }),

  newEndorsement: (endorserName: string, skill: string, profileUrl: string) => ({
    subject: `${endorserName} endorsed your skill: ${skill}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Skill Endorsement!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${endorserName}</strong> endorsed your skill in <strong>${skill}</strong>.
          </p>
          <div style="margin-top: 30px;">
            <a href="${profileUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Profile</a>
          </div>
        </div>
      </div>
    `,
  }),

  newReview: (reviewerName: string, rating: number, comment: string, profileUrl: string) => ({
    subject: `${reviewerName} left you a review on DevLink`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Review!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${reviewerName}</strong> left you a ${rating}-star review:
          </p>
          <div style="margin: 15px 0;">
            ${'⭐'.repeat(rating)}
          </div>
          <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 20px 0; color: #6b7280; font-style: italic;">${comment}</blockquote>
          <div style="margin-top: 30px;">
            <a href="${profileUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Reviews</a>
          </div>
        </div>
      </div>
    `,
  }),

  // Service Request Notifications
  newServiceRequest: (clientName: string, title: string, category: string, budget: string, requestUrl: string) => ({
    subject: `New Service Request: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">🎯 New Service Request</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${clientName}</strong> submitted a new service request that matches your expertise!
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">${title}</h3>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Category:</strong> ${category}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Budget:</strong> ${budget}</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${requestUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Request Details</a>
          </div>
        </div>
      </div>
    `,
  }),

  serviceRequestAssigned: (developerName: string, title: string, requestUrl: string) => ({
    subject: `Developer Assigned: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">✅ Developer Assigned!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Great news! <strong style="color: #3b82f6;">${developerName}</strong> has been assigned to your service request <strong>"${title}"</strong>.
          </p>
          <p style="color: #6b7280; margin-top: 10px;">They will start working on your project soon and keep you updated on the progress.</p>
          <div style="margin-top: 30px;">
            <a href="${requestUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Request</a>
          </div>
        </div>
      </div>
    `,
  }),

  serviceRequestStatusChanged: (title: string, oldStatus: string, newStatus: string, requestUrl: string) => ({
    subject: `Service Request Update: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">📊 Status Update</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Your service request <strong>"${title}"</strong> status has been updated.
          </p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Previous:</strong> <span style="text-transform: capitalize;">${oldStatus}</span></p>
            <p style="margin: 5px 0; color: #10b981;"><strong>Current:</strong> <span style="text-transform: capitalize;">${newStatus}</span></p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${requestUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Details</a>
          </div>
        </div>
      </div>
    `,
  }),

  serviceRequestCompleted: (title: string, requestUrl: string) => ({
    subject: `Service Request Completed: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">🎉 Project Completed!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Congratulations! Your service request <strong>"${title}"</strong> has been completed.
          </p>
          <p style="color: #6b7280; margin-top: 10px;">Please review the work and provide feedback to help other clients make informed decisions.</p>
          <div style="margin-top: 30px;">
            <a href="${requestUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin-right: 10px;">View Results</a>
          </div>
        </div>
      </div>
    `,
  }),

  // Admin Notifications
  developerApproved: (userName: string, dashboardUrl: string) => ({
    subject: `Welcome to DevLink - Your Developer Account is Approved! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">🎉 Welcome to DevLink!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Great news! Your developer account has been approved. You can now showcase your projects, connect with clients, and grow your professional network.
          </p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <h3 style="color: #047857; margin: 0 0 10px 0;">Get Started:</h3>
            <ul style="color: #065f46; margin: 0; padding-left: 20px;">
              <li>Complete your profile with your skills and experience</li>
              <li>Upload your best projects and case studies</li>
              <li>Write blog posts to showcase your expertise</li>
              <li>Connect with other developers and potential clients</li>
            </ul>
          </div>
          <div style="margin-top: 30px;">
            <a href="${dashboardUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Go to Dashboard</a>
          </div>
        </div>
      </div>
    `,
  }),

  developerRejected: (userName: string, reason: string) => ({
    subject: `DevLink Developer Application Update`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Developer Application Update</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Thank you for your interest in joining DevLink as a developer. After reviewing your application, we're unable to approve it at this time.
          </p>
          ${reason ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>` : ''}
          <p style="color: #6b7280; margin-top: 15px;">You're welcome to apply again in the future. In the meantime, you can still use DevLink to find and hire talented developers.</p>
        </div>
      </div>
    `,
  }),

  promotedToAdmin: (userName: string, dashboardUrl: string) => ({
    subject: `You've been promoted to Admin on DevLink`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #7c3aed; margin-bottom: 20px;">👑 Admin Access Granted</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Congratulations! You've been granted administrator privileges on DevLink. You now have access to:
          </p>
          <ul style="color: #6b7280; line-height: 1.8;">
            <li>Approve/reject developer applications</li>
            <li>Manage user accounts</li>
            <li>Monitor platform activity</li>
            <li>Access admin dashboard and analytics</li>
          </ul>
          <div style="margin-top: 30px;">
            <a href="${dashboardUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Access Admin Dashboard</a>
          </div>
        </div>
      </div>
    `,
  }),

  // Welcome Emails
  welcomeEmail: (userName: string, role: string, dashboardUrl: string) => ({
    subject: `Welcome to DevLink - Let's Get Started! 🚀`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #3b82f6; margin-bottom: 20px;">Welcome to DevLink! 🚀</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Welcome to DevLink - the ultimate platform for developers to showcase their skills, connect with clients, and build amazing projects together!
          </p>
          ${role === 'developer' ? `
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">Next Steps for Developers:</h3>
            <ol style="color: #1e3a8a; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Complete your profile with skills and experience</li>
              <li>Upload your GitHub account for verification</li>
              <li>Wait for admin approval (usually within 24 hours)</li>
              <li>Start showcasing your projects!</li>
            </ol>
          </div>
          ` : `
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0;">Next Steps for Clients:</h3>
            <ol style="color: #064e3b; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Browse our talented developer community</li>
              <li>Submit service requests for your projects</li>
              <li>Connect with developers that match your needs</li>
              <li>Build something amazing together!</li>
            </ol>
          </div>
          `}
          <div style="margin-top: 30px;">
            <a href="${dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Get Started</a>
          </div>
        </div>
      </div>
    `,
  }),

  // New Content Notifications
  newBlogPostPublished: (authorName: string, title: string, excerpt: string, postUrl: string) => ({
    subject: `${authorName} published a new article: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">📝 New Article Published</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${authorName}</strong> published a new article you might be interested in:
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">${title}</h3>
            <p style="color: #6b7280; line-height: 1.6;">${excerpt}</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${postUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Read Article</a>
          </div>
        </div>
      </div>
    `,
  }),

  newProjectAdded: (authorName: string, title: string, description: string, projectUrl: string) => ({
    subject: `${authorName} added a new project: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">🚀 New Project Showcase</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong style="color: #3b82f6;">${authorName}</strong> just added a new project to their portfolio:
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">${title}</h3>
            <p style="color: #6b7280; line-height: 1.6;">${description}</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${projectUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Project</a>
          </div>
        </div>
      </div>
    `,
  }),

  // Milestone Notifications
  milestoneAchieved: (userName: string, milestone: string, description: string, profileUrl: string) => ({
    subject: `🎉 Milestone Achieved: ${milestone}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #f59e0b; margin-bottom: 20px;">🎉 Congratulations, ${userName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            You've reached an amazing milestone on DevLink!
          </p>
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #78350f; margin: 0 0 10px 0; font-size: 24px;">${milestone}</h3>
            <p style="color: #92400e; margin: 0;">${description}</p>
          </div>
          <p style="color: #6b7280; text-align: center;">Keep up the great work! Your growing presence on DevLink is inspiring.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${profileUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Your Profile</a>
          </div>
        </div>
      </div>
    `,
  }),

  // Reminder Notifications
  pendingTestimonialsReminder: (count: number, testimonialsUrl: string) => ({
    subject: `You have ${count} pending testimonial${count > 1 ? 's' : ''} to review`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">⏰ Pending Testimonials</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            You have <strong>${count}</strong> testimonial${count > 1 ? 's' : ''} waiting for your review.
          </p>
          <p style="color: #6b7280; margin-top: 10px;">Approving testimonials helps build your professional credibility and showcases your work.</p>
          <div style="margin-top: 30px;">
            <a href="${testimonialsUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Review Testimonials</a>
          </div>
        </div>
      </div>
    `,
  }),

  incompleteProfileReminder: (userName: string, missingItems: string[], profileUrl: string) => ({
    subject: `Complete your DevLink profile to stand out!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">📋 Complete Your Profile</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Your profile is looking good, but it could be even better! Complete these items to maximize your visibility:
          </p>
          <ul style="color: #6b7280; line-height: 1.8; margin: 20px 0;">
            ${missingItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <p style="color: #6b7280;">Profiles with complete information get 3x more views!</p>
          <div style="margin-top: 30px;">
            <a href="${profileUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Complete Profile</a>
          </div>
        </div>
      </div>
    `,
  }),

  weeklyDigest: (userName: string, stats: any, dashboardUrl: string) => ({
    subject: `Your DevLink Weekly Summary 📊`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">📊 Your Weekly Summary</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            Hi <strong>${userName}</strong>,
          </p>
          <p style="color: #4b5563;">Here's what happened on your DevLink profile this week:</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${stats.newFollowers || 0}</div>
              <div style="color: #1e40af; font-size: 14px;">New Followers</div>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${stats.profileViews || 0}</div>
              <div style="color: #92400e; font-size: 14px;">Profile Views</div>
            </div>
            <div style="background: #fce7f3; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #ec4899;">${stats.likes || 0}</div>
              <div style="color: #9f1239; font-size: 14px;">Likes</div>
            </div>
            <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #6366f1;">${stats.comments || 0}</div>
              <div style="color: #3730a3; font-size: 14px;">Comments</div>
            </div>
          </div>
          <div style="margin-top: 30px;">
            <a href="${dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Dashboard</a>
          </div>
        </div>
      </div>
    `,
  }),
}