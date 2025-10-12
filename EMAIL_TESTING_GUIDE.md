# Email Notification Testing Guide

This guide explains all email notifications implemented in DevLink, where they're applied, and how to test each one.

**Recipient Email**: ahsanjalil681@gmail.com
**SMTP**: Gmail (smtp.gmail.com:587)

---

## Table of Contents
1. [Real-Time Notifications](#real-time-notifications)
2. [Service Request Notifications](#service-request-notifications)
3. [Admin Action Notifications](#admin-action-notifications)
4. [User Engagement Notifications](#user-engagement-notifications)
5. [Scheduled Job Notifications](#scheduled-job-notifications)
6. [Testing Instructions](#testing-instructions)
7. [Troubleshooting](#troubleshooting)

---

## Real-Time Notifications

### 1. Welcome Email
**Triggered**: When a new user registers
**File**: `app/api/auth/[...nextauth]/route.ts` or registration handler
**Template**: `emailTemplates.welcomeEmail()`

**How to Test**:
```bash
1. Go to /register or signup page
2. Create a new account
3. Check ahsanjalil681@gmail.com inbox
```

**Expected Email**:
- Subject: "Welcome to DevLink!"
- Content: Welcome message with getting started tips

---

### 2. New Follower Notification
**Triggered**: When someone follows a user
**File**: `lib/actions.ts` → `followUser()`
**Template**: `emailTemplates.followerNotification()`

**How to Test**:
```bash
1. Login as User A
2. Navigate to User B's profile
3. Click "Follow" button
4. User B receives email (if emailNotifications enabled)
```

**Expected Email**:
- Subject: "[Follower Name] is now following you on DevLink!"
- Content: Follower name, link to their profile

---

### 3. Like Notification (Projects/Posts)
**Triggered**: When someone likes a project or blog post
**File**: `app/api/likes/route.ts`
**Template**: `emailTemplates.likeNotification()`

**How to Test**:
```bash
# For Project Like:
1. Login as User A
2. Go to any project by User B
3. Click the "Like" button
4. User B receives email

# For Post Like:
1. Login as User A
2. Go to any blog post by User B
3. Click the "Like" button
4. User B receives email
```

**Expected Email**:
- Subject: "[User Name] liked your [project/post] on DevLink!"
- Content: User name, item title, link to view

---

### 4. Comment Notification
**Triggered**: When someone comments on a project or post
**File**: `lib/actions.ts` → `createComment()`
**Template**: `emailTemplates.commentNotification()`

**How to Test**:
```bash
1. Login as User A
2. Go to a project/post by User B
3. Write a comment and submit
4. User B receives email
```

**Expected Email**:
- Subject: "[User Name] commented on your [project/post]"
- Content: Comment preview, link to view full comment

---

### 5. New Project Added (Followers Notification)
**Triggered**: When a developer adds a new project
**File**: `lib/actions.ts` → `createProject()`
**Template**: Custom template in notifyFollowers()

**How to Test**:
```bash
1. User A follows User B
2. Login as User B (developer)
3. Go to /dashboard/projects
4. Create a new project
5. User A receives email
```

**Expected Email**:
- Subject: "[Developer Name] added a new project!"
- Content: Project title, description preview, link

---

### 6. New Blog Post Published (Followers Notification)
**Triggered**: When a blog post status changes to "published"
**File**: `lib/actions.ts` → `createBlogPost()` and `updateBlogPost()`
**Template**: Custom template in notifyFollowers()

**How to Test**:
```bash
# New Published Post:
1. User A follows User B
2. Login as User B
3. Create new blog post with published=true
4. User A receives email

# Draft to Published:
1. Edit existing draft post
2. Change status to published
3. Followers receive email
```

**Expected Email**:
- Subject: "[Author Name] published a new blog post!"
- Content: Post title, excerpt, read more link

---

### 7. Milestone Achievement Notifications
**Triggered**: When user reaches milestones (10, 50, 100, 500, 1000)
**File**: `lib/email.ts` → `checkAndNotifyMilestone()`
**Template**: `emailTemplates.milestoneAchieved()`

**Milestone Types**:
- Followers: 10, 50, 100, 500, 1000
- Profile Views: 100, 500, 1000, 5000, 10000
- Projects: 5, 10, 25, 50
- Posts: 5, 10, 25, 50

**How to Test** (requires database manipulation):
```bash
# Using Prisma Studio:
1. Open Prisma Studio: npx prisma studio
2. Go to User table
3. Find your test user
4. Manually set follower count to 49
5. Have someone follow you
6. You should receive "50 Followers" milestone email

# Or create test users programmatically to reach milestones
```

**Expected Email**:
- Subject: "Congratulations! You've reached [X] [metric]!"
- Content: Celebration message, milestone badge, stats

---

## Service Request Notifications

### 8. New Service Request (Notify All Developers)
**Triggered**: When a client creates a service request
**File**: `app/api/service-requests/route.ts` (POST)
**Template**: `emailTemplates.newServiceRequest()`

**How to Test**:
```bash
1. Ensure you have approved developers with emailNotifications=true
2. Login as client
3. Go to /services or service request form
4. Create a new service request
5. All approved developers receive email
```

**Expected Email**:
- Subject: "New Service Request: [Title]"
- Content: Request details, client info, view link

---

### 9. Service Request Assigned
**Triggered**: When developer accepts a service request
**File**: `app/api/service-requests/[id]/route.ts` (action: "accept")
**Template**: `emailTemplates.serviceRequestAssigned()`

**How to Test**:
```bash
1. Create service request as client
2. Login as developer
3. View service request and click "Accept"
4. Client receives assignment email
```

**Expected Email**:
- Subject: "Your service request has been assigned!"
- Content: Developer name, project details

---

### 10. Service Request Status Changed
**Triggered**: When service request status updates
**File**: `app/api/service-requests/[id]/route.ts` (action: "updateStatus")
**Template**: `emailTemplates.serviceRequestStatusChanged()`

**How to Test**:
```bash
1. Create and assign a service request
2. Login as developer
3. Change status (e.g., "In Progress" → "Review")
4. Client receives status update email
```

**Expected Email**:
- Subject: "Service Request Status Update"
- Content: Old status, new status, view link

---

### 11. Service Request Completed
**Triggered**: When developer marks request as completed
**File**: `app/api/service-requests/[id]/route.ts` (action: "updateStatus" with "completed")
**Template**: `emailTemplates.serviceRequestCompleted()`

**How to Test**:
```bash
1. Create and assign a service request
2. Login as developer
3. Mark request as "Completed"
4. Client receives completion email
```

**Expected Email**:
- Subject: "Your service request is completed!"
- Content: Developer info, testimonial request

---

## Admin Action Notifications

### 12. Developer Application Approved
**Triggered**: When admin approves developer application
**File**: `app/api/admin/users/route.ts` (approved: true)
**Template**: `emailTemplates.developerApproved()`

**How to Test**:
```bash
1. User registers as developer
2. Login as admin
3. Go to /admin/developers or admin panel
4. Approve the developer
5. Developer receives approval email
```

**Expected Email**:
- Subject: "Welcome to DevLink Developers!"
- Content: Approval confirmation, next steps

---

### 13. Developer Application Rejected
**Triggered**: When admin rejects developer application
**File**: `app/api/admin/users/route.ts` (approved: false)
**Template**: `emailTemplates.developerRejected()`

**How to Test**:
```bash
1. User registers as developer
2. Login as admin
3. Go to admin panel
4. Reject the developer application
5. User receives rejection email
```

**Expected Email**:
- Subject: "Developer Application Update"
- Content: Polite rejection, encouragement to reapply

---

### 14. Promoted to Admin
**Triggered**: When user is promoted to admin role
**File**: `app/api/admin/users/route.ts` (role: "admin")
**Template**: `emailTemplates.promotedToAdmin()`

**How to Test**:
```bash
1. Login as existing admin
2. Go to admin panel → users
3. Promote a user to admin role
4. User receives promotion email
```

**Expected Email**:
- Subject: "You've been promoted to Admin!"
- Content: New permissions explanation, admin dashboard link

---

## User Engagement Notifications

### 15. Profile View Tracking
**Triggered**: When someone views a user's profile
**File**: `lib/actions.ts` → `trackProfileView()`
**Note**: This checks for milestones, doesn't send individual view emails

**How to Test**:
```bash
1. Create test user
2. Have multiple users view their profile
3. When views reach milestone (100, 500, 1000), email sent
```

---

## Scheduled Job Notifications

### 16. Weekly Digest
**Scheduled**: Every Monday at 9:00 AM UTC
**File**: `lib/scheduled-jobs.ts` → `sendWeeklyDigests()`
**API**: `/api/cron/weekly-digest`
**Template**: `emailTemplates.weeklyDigest()`

**What it includes**:
- New followers this week
- Profile views
- Likes received
- Comments received

**How to Test Locally**:
```bash
curl -X POST http://localhost:3000/api/cron/weekly-digest \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"
```

**Expected Email**:
- Subject: "Your DevLink Weekly Digest"
- Content: Activity summary, stats, dashboard link

---

### 17. Pending Testimonials Reminder
**Scheduled**: Every 3 days at 10:00 AM UTC
**File**: `lib/scheduled-jobs.ts` → `sendTestimonialReminders()`
**API**: `/api/cron/testimonial-reminders`
**Template**: `emailTemplates.pendingTestimonialsReminder()`

**Triggered when**: User has testimonials pending for 3+ days

**How to Test Locally**:
```bash
# First, create pending testimonials (via UI or database)
# Then run:
curl -X POST http://localhost:3000/api/cron/testimonial-reminders \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"
```

**Expected Email**:
- Subject: "You have [X] pending testimonials"
- Content: Count of pending testimonials, review link

---

### 18. Incomplete Profile Reminder
**Scheduled**: Daily at 11:00 AM UTC (sends once at 7 days)
**File**: `lib/scheduled-jobs.ts` → `sendIncompleteProfileReminders()`
**API**: `/api/cron/incomplete-profile`
**Template**: `emailTemplates.incompleteProfileReminder()`

**Triggered when**: Developer registered 7 days ago with missing:
- Bio
- Skills
- GitHub link
- Location
- Projects (0 projects)

**How to Test Locally**:
```bash
# Create a developer account 7 days ago with incomplete profile
# Or modify createdAt in database to 7 days ago
# Then run:
curl -X POST http://localhost:3000/api/cron/incomplete-profile \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"
```

**Expected Email**:
- Subject: "Complete your DevLink profile"
- Content: Missing items list, completion link

---

### 19. Re-engagement Emails
**Scheduled**: Every Thursday at 2:00 PM UTC
**File**: `lib/scheduled-jobs.ts` → `sendReEngagementEmails()`
**API**: `/api/cron/re-engagement`

**Triggered when**: User inactive for 30+ days

**How to Test Locally**:
```bash
# Create user or modify updatedAt to 30+ days ago
# Then run:
curl -X POST http://localhost:3000/api/cron/re-engagement \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"
```

**Expected Email**:
- Subject: "We miss you on DevLink!"
- Content: What's new, return to platform link

---

### 20. Collaboration Request Reminders
**Scheduled**: Daily at 3:00 PM UTC
**File**: `lib/scheduled-jobs.ts` → `sendCollaborationRequestReminders()`
**API**: `/api/cron/collaboration-reminders`

**Triggered when**: Collaboration request pending for 3+ days

**How to Test Locally**:
```bash
# Create collaboration request 3+ days ago
# Or modify createdAt in database
# Then run:
curl -X POST http://localhost:3000/api/cron/collaboration-reminders \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"
```

**Expected Email**:
- Subject: "Reminder: Collaboration request from [Name]"
- Content: Request details, review link

---

## Complete Testing Checklist

### Prerequisites
```bash
# 1. Verify email configuration in .env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="ahsanjalil681@gmail.com"
SMTP_PASS="tlviozwxwgvwavpy"
FROM_EMAIL="ahsanjalil681@gmail.com"
CRON_SECRET="devlink_cron_secret_2024_secure_token_xyz123"

# 2. Start development server
npm run dev

# 3. Ensure users have emailNotifications=true in database
```

### Real-Time Email Tests (15 emails)
- [ ] Welcome Email - Register new user
- [ ] New Follower - Follow a user
- [ ] Like Project - Like someone's project
- [ ] Like Post - Like someone's blog post
- [ ] Comment - Add comment to project/post
- [ ] New Project - Create project (followers notified)
- [ ] New Blog Post - Publish new post (followers notified)
- [ ] Milestone - Reach follower/view/project/post milestone
- [ ] New Service Request - Create service request
- [ ] Service Assigned - Accept service request
- [ ] Status Changed - Update service request status
- [ ] Service Completed - Mark service as completed
- [ ] Developer Approved - Approve developer (admin)
- [ ] Developer Rejected - Reject developer (admin)
- [ ] Promoted to Admin - Promote user to admin

### Scheduled Email Tests (5 emails)
```bash
# Test all cron endpoints locally:

# 1. Weekly Digest
curl -X POST http://localhost:3000/api/cron/weekly-digest \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# 2. Testimonial Reminders
curl -X POST http://localhost:3000/api/cron/testimonial-reminders \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# 3. Incomplete Profile
curl -X POST http://localhost:3000/api/cron/incomplete-profile \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# 4. Re-engagement
curl -X POST http://localhost:3000/api/cron/re-engagement \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# 5. Collaboration Reminders
curl -X POST http://localhost:3000/api/cron/collaboration-reminders \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"
```

---

## Email Templates Location

All email templates are defined in: **`lib/email.ts`**

```typescript
export const emailTemplates = {
  welcomeEmail,
  followerNotification,
  likeNotification,
  commentNotification,
  newServiceRequest,
  serviceRequestAssigned,
  serviceRequestStatusChanged,
  serviceRequestCompleted,
  developerApproved,
  developerRejected,
  promotedToAdmin,
  newBlogPostPublished,
  newProjectAdded,
  milestoneAchieved,
  pendingTestimonialsReminder,
  incompleteProfileReminder,
  weeklyDigest
}
```

---

## Troubleshooting

### Emails Not Sending

**Check 1: Environment Variables**
```bash
# Verify .env file has correct values
cat .env | grep SMTP
```

**Check 2: Email Notifications Preference**
```bash
# Open Prisma Studio
npx prisma studio

# Check user has emailNotifications=true
```

**Check 3: Server Logs**
```bash
# Check console for email sending errors
# Look for "Email sent successfully" or error messages
```

**Check 4: Gmail App Password**
```bash
# Verify app password is correct and active
# Not expired or revoked
```

### Testing Specific User

To test with specific user email instead of always ahsanjalil681@gmail.com:

```bash
# 1. Update user's email in database via Prisma Studio
# 2. Or modify lib/email.ts sendEmail() for testing:

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // For testing, override recipient
  const testEmail = process.env.TEST_EMAIL || to

  // ... rest of code
}
```

### Cron Jobs Not Working

**Local Testing**: Use curl commands above

**Production (Vercel)**:
```bash
# 1. Check Vercel Dashboard → Settings → Cron Jobs
# 2. Verify CRON_SECRET is set in environment variables
# 3. Check function logs for execution
# 4. Verify vercel.json is deployed
```

---

## Quick Email Count

**Total Email Notifications**: 20 types

**Real-Time**: 15 notifications
- User Actions: 7 (welcome, follow, like, comment, project, post, milestone)
- Service Requests: 4 (new, assigned, status, completed)
- Admin Actions: 3 (approved, rejected, promoted)
- Engagement: 1 (profile views → milestones)

**Scheduled**: 5 notifications
- Weekly digest
- Testimonial reminders
- Incomplete profile
- Re-engagement
- Collaboration reminders

---

## Need Help?

- **Email Configuration**: See `.env` file
- **Email Templates**: See `lib/email.ts`
- **Scheduled Jobs**: See `lib/scheduled-jobs.ts`
- **Documentation**: See `EMAIL_NOTIFICATIONS.md` and `SCHEDULED_JOBS_SETUP.md`

---

**Last Updated**: 2024
**Recipient**: ahsanjalil681@gmail.com
**SMTP Provider**: Gmail
