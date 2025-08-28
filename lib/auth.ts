import { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email public_repo"
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          bio: profile.bio,
          location: profile.location,
          website: profile.blog,
          github: profile.html_url,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string
        
        // Fetch fresh user data from database
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { username: true }
          })
          if (dbUser) {
            session.user.username = dbUser.username || undefined
          }
        } catch (error) {
          console.error('Error fetching user data in session:', error)
        }
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Handle GitHub profile setup after successful sign in
      if (account?.provider === "github" && profile) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          })
          
          if (existingUser && !existingUser.username) {
            let baseUsername = (profile as any).login || user.name?.toLowerCase().replace(/\s+/g, '_') || user.email?.split('@')[0] || 'user'
            let username = baseUsername
            let counter = 1
            
            // Check if username exists and append number if needed
            while (await db.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`
              counter++
            }

            // Update user profile with GitHub data
            await db.user.update({
              where: { id: existingUser.id },
              data: { 
                username,
                bio: (profile as any).bio || null,
                location: (profile as any).location || null,
                website: (profile as any).blog || null,
                github: (profile as any).html_url || null,
              },
            })
          }
        } catch (error) {
          console.error('Error updating user profile:', error)
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async linkAccount({ user, account, profile }) {
      // Update user profile with additional data from the linked account
      if (account.provider === "github" && profile) {
        await db.user.update({
          where: { id: user.id },
          data: {
            bio: (profile as any).bio || undefined,
            location: (profile as any).location || undefined,
            website: (profile as any).blog || undefined,
            github: (profile as any).html_url || undefined,
          },
        })
      }
    },
  },
}