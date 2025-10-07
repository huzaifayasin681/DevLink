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
          role: "client",
          approved: true,
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo"
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
          role: "developer",
          approved: false,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.approved = token.approved as boolean
        session.user.isAdmin = token.isAdmin as boolean
        
        // Fetch fresh user data from database
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { username: true, role: true, approved: true, isAdmin: true }
          })
          if (dbUser) {
            session.user.username = dbUser.username || undefined
            session.user.role = dbUser.role
            session.user.approved = dbUser.approved
            session.user.isAdmin = dbUser.isAdmin
          }
        } catch (error) {
          console.error('Error fetching user data in session:', error)
        }
      }
      return session
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "client"
        token.approved = user.approved || false
        token.isAdmin = user.isAdmin || false
      }
      
      // Refresh token data on update
      if (trigger === "update") {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, approved: true, isAdmin: true }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.approved = dbUser.approved
          token.isAdmin = dbUser.isAdmin
        }
      }
      
      return token
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          const githubUsername = (profile as any).login
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          })
          
          if (existingUser) {
            // Block unapproved developers (except first user)
            if (existingUser.role === "developer" && !existingUser.approved && githubUsername !== "huzaifayasin681") {
              return "/login?error=pending_approval"
            }
            
            // Update user with GitHub data if needed
            if (!existingUser.username) {
              let username = githubUsername
              let counter = 1
              
              while (await db.user.findUnique({ where: { username } })) {
                username = `${githubUsername}${counter}`
                counter++
              }
              
              // Auto-approve first user (huzaifayasin681), others need approval
              const isFirstUser = githubUsername === "huzaifayasin681"

              await db.user.update({
                where: { id: existingUser.id },
                data: { 
                  username,
                  bio: (profile as any).bio || null,
                  location: (profile as any).location || null,
                  website: (profile as any).blog || null,
                  github: (profile as any).html_url || null,
                  role: "developer",
                  approved: isFirstUser,
                  isAdmin: isFirstUser,
                },
              })
            }
          }
        } catch (error) {
          console.error('Error in GitHub sign in:', error)
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