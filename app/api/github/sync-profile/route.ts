import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    })

    if (!account?.access_token) {
      return NextResponse.json({ error: "GitHub account not linked" }, { status: 400 })
    }

    // Fetch GitHub user data
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevLink-App'
      }
    })

    if (!userRes.ok) {
      return NextResponse.json({ error: "Failed to fetch GitHub profile" }, { status: 500 })
    }

    const githubUser = await userRes.json()

    // Fetch user's repositories to extract skills
    const reposRes = await fetch("https://api.github.com/user/repos?per_page=100", {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevLink-App'
      }
    })

    let skills: string[] = []
    if (reposRes.ok) {
      const repos = await reposRes.json()
      const languages = new Set<string>()
      
      repos.forEach((repo: any) => {
        if (repo.language) languages.add(repo.language)
        if (repo.topics) repo.topics.forEach((topic: string) => languages.add(topic))
      })
      
      skills = Array.from(languages).slice(0, 20)
    }

    // Update user profile
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        bio: githubUser.bio || undefined,
        location: githubUser.location || undefined,
        website: githubUser.blog || undefined,
        twitter: githubUser.twitter_username ? `https://twitter.com/${githubUser.twitter_username}` : undefined,
        skills: skills.length > 0 ? skills : undefined,
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Profile synced successfully",
      updated: {
        bio: !!updated.bio,
        location: !!updated.location,
        website: !!updated.website,
        twitter: !!updated.twitter,
        skills: updated.skills.length
      }
    })
  } catch (error) {
    console.error("Error syncing GitHub profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
