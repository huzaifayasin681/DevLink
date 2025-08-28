# DevLink - Deployment Guide

This guide will help you deploy DevLink to Vercel in production.

## Prerequisites

Before deploying, make sure you have:

1. **MongoDB Database**: Set up a MongoDB Atlas cluster or use another MongoDB hosting service
2. **GitHub OAuth App**: Create a GitHub OAuth application
3. **Google OAuth App**: Create a Google OAuth application  
4. **Vercel Account**: Sign up for a free Vercel account

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/devlink`)

## Step 2: Set up OAuth Applications

### GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: `DevLink`
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
4. Save the Client ID and Client Secret

### Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure the consent screen
6. Set authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
7. Save the Client ID and Client Secret

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in the Vercel dashboard:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/devlink
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts to link your project
4. Set environment variables: `vercel env add`
5. Deploy: `vercel --prod`

## Step 4: Set up Database

After deployment, you need to set up your database schema:

1. Go to your deployed app
2. The Prisma client will automatically create the necessary collections when you first use the app
3. Alternatively, you can run database migrations locally and push to your MongoDB Atlas cluster

## Step 5: Update OAuth Redirect URLs

Once your app is deployed, update your OAuth applications with the correct URLs:

- GitHub: `https://your-actual-domain.vercel.app/api/auth/callback/github`
- Google: `https://your-actual-domain.vercel.app/api/auth/callback/google`

## Step 6: Test Your Deployment

1. Visit your deployed app
2. Try signing in with GitHub and Google
3. Create a test profile
4. Verify all features work correctly

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/devlink` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `your-super-secret-key` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `abc123def456` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | `secret123` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `secret456` |

## Troubleshooting

### Common Issues

1. **OAuth Errors**: Make sure your redirect URLs match exactly
2. **Database Connection**: Verify your MongoDB connection string and network access
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Errors**: Check the Vercel build logs for specific error messages

### Getting Help

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Test OAuth applications in development first
4. Check MongoDB Atlas network access settings

## Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project settings
2. Add your custom domain
3. Update your OAuth redirect URLs to use the custom domain
4. Update the `NEXTAUTH_URL` environment variable

## Security Considerations

- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Regularly rotate OAuth client secrets
- Monitor your MongoDB Atlas access logs
- Enable MongoDB Atlas IP whitelisting if needed
- Keep your dependencies updated

## Performance Optimization

- Vercel automatically optimizes your Next.js app
- MongoDB Atlas provides built-in performance monitoring
- Consider upgrading to paid plans for better performance
- Monitor your app's performance with Vercel Analytics

Your DevLink app should now be successfully deployed and ready for users!