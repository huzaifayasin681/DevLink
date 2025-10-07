import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's GitHub access token
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    })

    if (!account?.access_token) {
      return NextResponse.json({ error: "GitHub account not linked. Please logout and login again with GitHub." }, { status: 400 })
    }

    // Fetch repositories from GitHub API
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevLink-App'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GitHub API Error:', response.status, errorText)
      return NextResponse.json({ 
        error: `GitHub API error: ${response.status}. Token may be expired. Please logout and login again.` 
      }, { status: 500 })
    }

    const repos = await response.json()
    
    // Filter and format repositories
    const filteredRepos = repos
      .filter((repo: any) => !repo.private) // Only public repos
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        fork: repo.fork,
        updated_at: repo.updated_at
      }))

    return NextResponse.json({ repos: filteredRepos })
  } catch (error) {
    console.error("Error fetching GitHub repos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}