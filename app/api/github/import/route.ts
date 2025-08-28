import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { repoIds } = await request.json()

    if (!Array.isArray(repoIds) || repoIds.length === 0) {
      return NextResponse.json({ error: "Invalid repository IDs" }, { status: 400 })
    }

    // Get user's GitHub access token
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    })

    if (!account?.access_token) {
      return NextResponse.json({ error: "GitHub account not linked" }, { status: 400 })
    }

    // Fetch selected repositories from GitHub API
    const importedProjects = []
    
    for (const repoId of repoIds.slice(0, 10)) { // Limit to 10
      try {
        const response = await fetch(`https://api.github.com/repositories/${repoId}`, {
          headers: {
            'Authorization': `token ${account.access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })

        if (response.ok) {
          const repo = await response.json()
          
          // Create project from repository
          const project = await db.project.create({
            data: {
              title: repo.name,
              description: repo.description || `GitHub repository: ${repo.name}`,
              content: `# ${repo.name}\n\n${repo.description || ''}\n\n[View on GitHub](${repo.html_url})`,
              githubUrl: repo.html_url,
              liveUrl: repo.homepage || null,
              technologies: repo.language ? [repo.language] : [],
              featured: repo.stargazers_count > 5,
              userId: session.user.id,
            },
          })
          
          importedProjects.push(project)
        }
      } catch (error) {
        console.error(`Failed to import repo ${repoId}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      imported: importedProjects.length,
      projects: importedProjects 
    })
  } catch (error) {
    console.error("Error importing repositories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}