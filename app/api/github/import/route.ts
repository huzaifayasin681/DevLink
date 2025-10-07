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
            'Authorization': `Bearer ${account.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DevLink-App'
          }
        })

        if (response.ok) {
          const repo = await response.json()
          
          // Fetch README
          let readmeContent = ''
          try {
            const readmeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
                'Accept': 'application/vnd.github.v3.raw',
                'User-Agent': 'DevLink-App'
              }
            })
            if (readmeRes.ok) {
              readmeContent = await readmeRes.text()
            }
          } catch (e) {
            console.log('No README found')
          }

          // Fetch contributors
          let contributors = 0
          try {
            const contribRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contributors?per_page=1`, {
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DevLink-App'
              }
            })
            if (contribRes.ok) {
              const linkHeader = contribRes.headers.get('Link')
              if (linkHeader) {
                const match = linkHeader.match(/page=(\d+)>; rel="last"/)
                contributors = match ? parseInt(match[1]) : 1
              } else {
                contributors = 1
              }
            }
          } catch (e) {
            console.log('No contributors found')
          }

          // Fetch recent commits count
          let commitsCount = 0
          try {
            const commitsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=1`, {
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DevLink-App'
              }
            })
            if (commitsRes.ok) {
              const linkHeader = commitsRes.headers.get('Link')
              if (linkHeader) {
                const match = linkHeader.match(/page=(\d+)>; rel="last"/)
                commitsCount = match ? parseInt(match[1]) : 1
              } else {
                commitsCount = 1
              }
            }
          } catch (e) {
            console.log('No commits found')
          }

          // Fetch languages
          let languages: string[] = []
          try {
            const langRes = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'DevLink-App'
              }
            })
            if (langRes.ok) {
              const langData = await langRes.json()
              languages = Object.keys(langData).slice(0, 5)
            }
          } catch (e) {
            console.log('No languages found')
          }

          // Get topics as additional technologies
          const topics = repo.topics || []
          const allTech = [...new Set([...languages, ...topics])].slice(0, 10)

          // Extract image from README if exists
          let imageUrl = null
          if (readmeContent) {
            const imgMatch = readmeContent.match(/!\[.*?\]\((https?:\/\/.*?)\)/)
            if (imgMatch) {
              imageUrl = imgMatch[1]
            }
          }
          
          // Build comprehensive content
          const projectContent = readmeContent || `# ${repo.name}

${repo.description || 'A GitHub repository showcasing development work.'}

## 📊 Repository Statistics

- ⭐ **Stars**: ${repo.stargazers_count}
- 🍴 **Forks**: ${repo.forks_count}
- 👁️ **Watchers**: ${repo.watchers_count}
- 👥 **Contributors**: ${contributors}
- 📝 **Commits**: ${commitsCount}+
- 📅 **Created**: ${new Date(repo.created_at).toLocaleDateString()}
- 🔄 **Last Updated**: ${new Date(repo.updated_at).toLocaleDateString()}

## 🛠️ Technologies Used

${allTech.map(tech => `- ${tech}`).join('\n')}

## 🔗 Links

- [View Repository on GitHub](${repo.html_url})
${repo.homepage ? `- [Live Demo](${repo.homepage})` : ''}

## 📄 License

${repo.license ? repo.license.name : 'No license specified'}

---

*This project was imported from GitHub*`
          
          // Create project from repository
          const project = await db.project.create({
            data: {
              title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              description: repo.description || `A ${repo.language || 'software'} project with ${repo.stargazers_count} stars on GitHub`,
              content: projectContent,
              imageUrl: imageUrl,
              githubUrl: repo.html_url,
              liveUrl: repo.homepage || null,
              technologies: allTech.length > 0 ? allTech : (repo.language ? [repo.language] : ['GitHub']),
              featured: repo.stargazers_count >= 5,
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