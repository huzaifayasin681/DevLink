import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect to login if no token
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Developer routes - require developer role AND approval
    if (path.startsWith("/developer")) {
      if (token.role !== "developer") {
        return NextResponse.redirect(new URL("/client/dashboard", req.url))
      }
      if (!token.approved) {
        return NextResponse.redirect(new URL("/pending-approval", req.url))
      }
    }

    // Client routes - require client role
    if (path.startsWith("/client")) {
      if (token.role !== "client") {
        return NextResponse.redirect(new URL("/developer/dashboard", req.url))
      }
    }

    // Admin routes - require admin access
    if (path.startsWith("/admin")) {
      if (!token.isAdmin) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Old dashboard route - redirect based on role
    if (path === "/dashboard") {
      if (token.role === "client") {
        return NextResponse.redirect(new URL("/client/dashboard", req.url))
      } else if (token.role === "developer" && token.approved) {
        return NextResponse.redirect(new URL("/developer/dashboard", req.url))
      } else if (token.role === "developer" && !token.approved) {
        return NextResponse.redirect(new URL("/pending-approval", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/client/:path*",
    "/developer/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ]
}
