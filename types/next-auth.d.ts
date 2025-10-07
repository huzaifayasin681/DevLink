import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      username?: string
      role: string
      approved: boolean
      isAdmin: boolean
    }
  }

  interface User {
    username?: string
    role?: string
    approved?: boolean
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string
    role: string
    approved: boolean
    isAdmin: boolean
  }
}