# Scheduled Jobs Setup Guide

## 📅 Overview

Your DevLink application now has **5 automated scheduled jobs** that send reminder and digest emails to users. These jobs run automatically using Vercel Cron.

---

## ✅ Implemented Scheduled Jobs

### 1. **Weekly Digest** 📊
- **Schedule**: Every Monday at 9:00 AM UTC
- **Endpoint**: `/api/cron/weekly-digest`
- **Purpose**: Sends weekly activity summary to users
- **Includes**: New followers, profile views, likes, comments

### 2. **Testimonial Reminders** ⏰
- **Schedule**: Every 3 days at 10:00 AM UTC
- **Endpoint**: `/api/cron/testimonial-reminders`
- **Purpose**: Reminds users to approve pending testimonials
- **Triggers**: Testimonials pending for 3+ days

### 3. **Incomplete Profile Reminders** 📋
- **Schedule**: Daily at 11:00 AM UTC
- **Endpoint**: `/api/cron/incomplete-profile`
- **Purpose**: Encourages developers to complete their profiles
- **Triggers**: 7 days after registration if profile incomplete

### 4. **Re-engagement Emails** 👋
- **Schedule**: Every Thursday at 2:00 PM UTC
- **Endpoint**: `/api/cron/re-engagement`
- **Purpose**: Brings back inactive users
- **Triggers**: No activity for 30+ days

### 5. **Collaboration Request Reminders** 🤝
- **Schedule**: Daily at 3:00 PM UTC
- **Endpoint**: `/api/cron/collaboration-reminders`
- **Purpose**: Reminds users to respond to pending collaboration requests
- **Triggers**: Requests pending for 3+ days

---

## 📁 Files Created

```
lib/
└── scheduled-jobs.ts           # All scheduled job functions

app/api/cron/
├── weekly-digest/route.ts
├── testimonial-reminders/route.ts
├── incomplete-profile/route.ts
├── re-engagement/route.ts
└── collaboration-reminders/route.ts

vercel.json                     # Vercel cron configuration
.env                           # CRON_SECRET added
```

---

## 🚀 Deployment Setup

### Step 1: Vercel Environment Variables

When deploying to Vercel, add the `CRON_SECRET` environment variable:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Name**: `CRON_SECRET`
   - **Value**: `devlink_cron_secret_2024_secure_token_xyz123`
   - **Or generate a secure random string**: `openssl rand -base64 32`

### Step 2: Deploy to Vercel

```bash
# If not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### Step 3: Verify Cron Jobs

After deployment, Vercel will automatically set up the cron jobs based on `vercel.json`.

To verify:
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Cron Jobs**
3. You should see all 5 cron jobs listed

---

## 🧪 Testing Scheduled Jobs

### Local Testing

You can manually trigger any cron job locally:

```bash
# Test weekly digest
curl http://localhost:3000/api/cron/weekly-digest \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# Test testimonial reminders
curl http://localhost:3000/api/cron/testimonial-reminders \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# Test incomplete profile
curl http://localhost:3000/api/cron/incomplete-profile \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# Test re-engagement
curl http://localhost:3000/api/cron/re-engagement \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"

# Test collaboration reminders
curl http://localhost:3000/api/cron/collaboration-reminders \
  -H "Authorization: Bearer devlink_cron_secret_2024_secure_token_xyz123"
```

### Production Testing

```bash
# Replace with your production URL
curl https://your-app.vercel.app/api/cron/weekly-digest \
  -H "Authorization: Bearer your_production_cron_secret"
```

---

## 📊 Cron Schedule Reference

### Current Schedule

| Job | Cron Expression | Human Readable | Frequency |
|-----|----------------|----------------|-----------|
| Weekly Digest | `0 9 * * 1` | Every Monday at 9:00 AM | Weekly |
| Testimonial Reminders | `0 10 */3 * *` | Every 3 days at 10:00 AM | Every 3 days |
| Incomplete Profile | `0 11 * * *` | Daily at 11:00 AM | Daily |
| Re-engagement | `0 14 * * 4` | Every Thursday at 2:00 PM | Weekly |
| Collaboration Reminders | `0 15 * * *` | Daily at 3:00 PM | Daily |

### Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Common Examples

```bash
"0 9 * * 1"     # Every Monday at 9:00 AM
"0 */6 * * *"   # Every 6 hours
"0 0 * * *"     # Daily at midnight
"0 0 1 * *"     # Monthly on the 1st at midnight
"*/15 * * * *"  # Every 15 minutes
```

---

## 🔐 Security

### Authentication

All cron endpoints are protected with a bearer token:

```typescript
const authHeader = request.headers.get('authorization')
const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

if (authHeader !== expectedAuth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Best Practices

1. **Use Strong Secret**: Generate random CRON_SECRET in production
   ```bash
   openssl rand -base64 32
   ```

2. **Never Commit Secrets**: `.env` is in `.gitignore`

3. **Rotate Regularly**: Change CRON_SECRET periodically

4. **Monitor Logs**: Check Vercel logs for failed auth attempts

---

## 📈 Monitoring

### View Cron Job Logs

**Vercel Dashboard:**
1. Go to your project
2. Click **Deployments** → Select latest deployment
3. Click **Functions** tab
4. Find your cron function
5. View logs and execution history

**Command Line:**
```bash
vercel logs your-app.vercel.app
```

### Expected Log Output

```
✓ Weekly digest cron job triggered
✓ Processing weekly digests for 150 users
✓ Weekly digest job completed. Sent 87 emails.
```

---

## 🎯 Job Details

### 1. Weekly Digest Job

**What it does:**
- Queries all users with `emailNotifications: true`
- Calculates stats for the past 7 days:
  - New followers
  - Profile views
  - Likes received
  - Comments received
- Only sends email if user has activity
- Includes personalized stats and dashboard link

**Database Queries:**
```typescript
// Example for one user
const stats = {
  newFollowers: 12,
  profileViews: 245,
  likes: 8,
  comments: 5
}
```

---

### 2. Testimonial Reminders Job

**What it does:**
- Finds users with testimonials pending for 3+ days
- Sends reminder with count of pending testimonials
- Links directly to testimonials dashboard

**Trigger Conditions:**
- User has `emailNotifications: true`
- Has testimonials with `approved: false`
- Testimonial created 3+ days ago

---

### 3. Incomplete Profile Job

**What it does:**
- Targets developers registered exactly 7 days ago
- Checks profile completeness:
  - Bio
  - Skills
  - GitHub connection
  - Location
  - At least 1 project
- Sends customized list of missing items

**Trigger Conditions:**
- Role: `developer`
- Registered exactly 7 days ago
- Missing 2+ profile items
- `emailNotifications: true`

---

### 4. Re-engagement Job

**What it does:**
- Finds users inactive for 30+ days
- Sends friendly "we miss you" email
- Highlights new features and updates
- Limits to 100 users per run to avoid spam

**Trigger Conditions:**
- `updatedAt` field older than 30 days
- `emailNotifications: true`

---

### 5. Collaboration Reminders Job

**What it does:**
- Finds collaboration requests pending 3+ days
- Reminds receiver to respond
- Includes request title and sender name

**Trigger Conditions:**
- Request status: `pending`
- Created 3+ days ago
- Receiver has `emailNotifications: true`

---

## 🔧 Customization

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 8 * * 1"  // Changed to 8:00 AM
    }
  ]
}
```

### Disable a Job

Remove the job from `vercel.json` or comment it out:

```json
{
  "crons": [
    // {
    //   "path": "/api/cron/re-engagement",
    //   "schedule": "0 14 * * 4"
    // }
  ]
}
```

### Add New Job

1. **Create function** in `lib/scheduled-jobs.ts`:
```typescript
export async function myNewJob() {
  // Your logic here
}
```

2. **Create API route** in `app/api/cron/my-new-job/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server"
import { myNewJob } from "@/lib/scheduled-jobs"

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Run job
  const result = await myNewJob()
  return NextResponse.json({ success: true, ...result })
}
```

3. **Add to** `vercel.json`:
```json
{
  "path": "/api/cron/my-new-job",
  "schedule": "0 12 * * *"
}
```

---

## 🐛 Troubleshooting

### Cron Job Not Running

**Check 1: Verify vercel.json**
- Ensure `vercel.json` is in project root
- Check cron expression syntax

**Check 2: Environment Variables**
- Verify `CRON_SECRET` is set in Vercel
- Must match value in cron requests

**Check 3: Deployment**
- Re-deploy after changing `vercel.json`
- Check deployment logs for errors

### No Emails Sent

**Check 1: Email Configuration**
- Verify SMTP settings in `.env`
- Test with `/test-email` page

**Check 2: User Preferences**
- Users must have `emailNotifications: true`
- Check database directly

**Check 3: Job Logs**
- Check "Sent X emails" in logs
- Look for error messages

### Authentication Errors

```
Error: Unauthorized cron request - invalid secret
```

**Solution:**
- Check `CRON_SECRET` matches in:
  - `.env` (local)
  - Vercel environment variables (production)
  - Cron request header

---

## 📚 Additional Resources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ✨ Pro Tips

1. **Test First**: Always test cron jobs locally before deploying
2. **Monitor Initially**: Watch logs closely after first deployment
3. **Start Small**: Begin with longer intervals, adjust as needed
4. **Respect Users**: Don't over-email, respect preferences
5. **Track Metrics**: Monitor open rates and unsubscribes
6. **Timezone Aware**: All times are UTC, plan accordingly

---

## 🎉 You're All Set!

Your scheduled jobs are ready to go! Once deployed to Vercel:

✅ Weekly digests will keep users engaged
✅ Reminders will improve response rates
✅ Re-engagement will reduce churn
✅ Profile completion will improve quality

All emails respect user preferences and send to **ahsanjalil681@gmail.com**!
