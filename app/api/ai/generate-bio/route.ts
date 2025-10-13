import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const { githubUsername } = await request.json();

    // Fetch user's projects from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        projects: {
          select: {
            title: true,
            description: true,
            technologies: true,
          },
          take: 10,
        },
      },
    });

    // Fetch GitHub data
    let githubData = null;
    if (githubUsername) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const githubRes = await fetch(
          `${baseUrl}/api/github/developer-data?username=${githubUsername}`,
          { cache: "no-store" }
        );
        if (githubRes.ok) {
          githubData = await githubRes.json();
        }
      } catch (error) {
        console.error("GitHub fetch error:", error);
      }
    }

    const prompt = `Generate a professional, compelling bio for a developer's portfolio.

${githubData ? `GitHub Profile:
- Name: ${githubData.profile.name || "Not provided"}
- Location: ${githubData.profile.location || "Not provided"}
- Company: ${githubData.profile.company || "Not provided"}
- Public Repos: ${githubData.profile.publicRepos}
- Top Languages: ${Object.keys(githubData.languages).slice(0, 5).join(", ")}

Recent Repositories:
${githubData.repositories.slice(0, 5).map((repo: any) => 
  `- ${repo.name}: ${repo.description || "No description"} (${repo.language})`
).join("\n")}` : ""}

${user?.projects && user.projects.length > 0 ? `Portfolio Projects:
${user.projects.map(p => 
  `- ${p.title}: ${p.description} (${p.technologies.join(", ")})`
).join("\n")}` : ""}

Generate 3 different bio variations:
1. Short (50-80 words) - Concise and impactful
2. Medium (100-150 words) - Balanced detail
3. Long (150-200 words) - Comprehensive

Format as JSON:
{
  "short": "short bio text",
  "medium": "medium bio text",
  "long": "long bio text",
  "suggestedSkills": ["skill1", "skill2", ...]
}

Make it professional, engaging, and highlight key strengths.`;

    const text = await generateContent(prompt);
    
    if (!text) {
      throw new Error("No response from AI");
    }
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate bio" },
      { status: 500 }
    );
  }
}
