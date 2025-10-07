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
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Email send error:', error)
  }
}

export const emailTemplates = {
  newFollower: (followerName: string, profileUrl: string) => ({
    subject: `${followerName} started following you on DevLink`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Follower!</h2>
        <p><strong>${followerName}</strong> started following you on DevLink.</p>
        <a href="${profileUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>
      </div>
    `,
  }),
  
  newLike: (likerName: string, itemTitle: string, itemUrl: string) => ({
    subject: `${likerName} liked your ${itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Like!</h2>
        <p><strong>${likerName}</strong> liked your "${itemTitle}".</p>
        <a href="${itemUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Item</a>
      </div>
    `,
  }),
  
  newComment: (commenterName: string, itemTitle: string, comment: string, itemUrl: string) => ({
    subject: `${commenterName} commented on your ${itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Comment!</h2>
        <p><strong>${commenterName}</strong> commented on your "${itemTitle}":</p>
        <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0;">${comment}</blockquote>
        <a href="${itemUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Comment</a>
      </div>
    `,
  }),
}