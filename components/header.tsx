"use client"

import { useSession, signOut } from "next-auth/react"
import { LoadingLink } from "@/components/loading-link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, PlusCircle, Search } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { DevLinkLogo } from "@/components/devlink-logo"

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl glass-nav rounded-2xl">
      <div className="container flex h-16 items-center px-6">
        <div className="mr-4 flex">
          <LoadingLink href="/" className="mr-6">
            <DevLinkLogo size="sm" />
          </LoadingLink>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <nav className="flex items-center space-x-8 text-sm font-medium">
              {!session && (
                <LoadingLink
                  href="/explore"
                  className="relative px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg text-foreground/70 hover:text-foreground group overflow-hidden"
                >
                  <span className="relative z-10">Explore</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </LoadingLink>
              )}
              {session && session.user.role === "client" && (
                <>
                  <LoadingLink
                    href="/client/dashboard"
                    className="relative px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg text-foreground/70 hover:text-foreground group overflow-hidden"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </LoadingLink>
                  <LoadingLink
                    href="/client/requests"
                    className="relative px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg text-foreground/70 hover:text-foreground group overflow-hidden"
                  >
                    <span className="relative z-10">My Requests</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </LoadingLink>
                </>
              )}
              {session && session.user.role === "developer" && session.user.approved && (
                <>
                  <LoadingLink
                    href="/developer/dashboard"
                    className="relative px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg text-foreground/70 hover:text-foreground group overflow-hidden"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </LoadingLink>
                  <LoadingLink
                    href={`/${session.user.username}`}
                    className="relative px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg text-foreground/70 hover:text-foreground group overflow-hidden"
                  >
                    <span className="relative z-10">Portfolio</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </LoadingLink>
                  <LoadingLink
                    href="/developer/requests"
                    className="relative px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg text-foreground/70 hover:text-foreground group overflow-hidden"
                  >
                    <span className="relative z-10">Requests</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </LoadingLink>
                  {session.user.isAdmin && (
                    <LoadingLink
                      href="/admin/dashboard"
                      className="relative px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-lg text-foreground/70 hover:text-foreground group overflow-hidden"
                    >
                      <span className="relative z-10">Admin</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </LoadingLink>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" asChild className="hover:bg-white/10 hover:scale-110 transition-all duration-300 rounded-xl">
              <LoadingLink href="/explore">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search developers</span>
              </LoadingLink>
            </Button>

            <div className="hover:scale-110 transition-all duration-300">
              <ThemeToggle />
            </div>

            {status === "loading" ? (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse backdrop-blur" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:scale-105 transition-transform">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback>{getInitials(session.user.name || "U")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user.name && <p className="font-medium">{session.user.name}</p>}
                      {session.user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {session.user.role === "client" && (
                    <>
                      <DropdownMenuItem asChild>
                        <LoadingLink href="/client/dashboard">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </LoadingLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <LoadingLink href="/client/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </LoadingLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <LoadingLink href="/client/requests/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>New Request</span>
                        </LoadingLink>
                      </DropdownMenuItem>
                    </>
                  )}
                  {session.user.role === "developer" && session.user.approved && (
                    <>
                      <DropdownMenuItem asChild>
                        <LoadingLink href={`/${session.user.username}`}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Portfolio</span>
                        </LoadingLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <LoadingLink href="/developer/dashboard">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </LoadingLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <LoadingLink href="/dashboard/projects/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>New Project</span>
                        </LoadingLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <LoadingLink href="/dashboard/testimonials">
                          <User className="mr-2 h-4 w-4" />
                          <span>Testimonials</span>
                        </LoadingLink>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="hover:bg-white/10 hover:scale-105 transition-all duration-300 rounded-xl">
                  <LoadingLink href="/login">Sign In</LoadingLink>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl hover-glow">
                  <LoadingLink href="/login">Get Started</LoadingLink>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}