import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { message, username } = await request.json();

    if (!message || !username) {
      return NextResponse.json(
        { error: "Message and username required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Fetch GitHub data
    let githubData;
    try {
      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`;
      const githubRes = await fetch(
        `${baseUrl}/api/github/developer-data?username=${username}`,
        { cache: "no-store" }
      );
      
      if (!githubRes.ok) {
        throw new Error("GitHub API failed");
      }

      githubData = await githubRes.json();
    } catch (error) {
      console.error("GitHub fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch developer data" },
        { status: 500 }
      );
    }

    // Fetch README from top repositories
    let readmeContents = "";
    try {
      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`;
      const topRepos = githubData.repositories.slice(0, 3);
      for (const repo of topRepos) {
        try {
          const readmeRes = await fetch(
            `${baseUrl}/api/github/readme?owner=${username}&repo=${repo.name}`,
            { cache: "no-store" }
          );
          if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            readmeContents += `\n\n### ${repo.name} README:\n${readmeData.content.substring(0, 1000)}`;
          }
        } catch (error) {
          console.error(`Failed to fetch README for ${repo.name}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch READMEs:", error);
    }

    // Create context for Gemini
    const context = `You are an AI assistant helping users learn about a developer named ${githubData.profile.name || username}.

IMPORTANT RULES:
- ONLY answer questions about this developer's profile, projects, skills, and GitHub activity
- If asked about unrelated topics (politics, personal life, other people, general knowledge), politely redirect: "I can only answer questions about ${githubData.profile.name || username}'s development work and GitHub profile."
- Stay professional and focused on technical information

Developer Information:
- Name: ${githubData.profile.name || "Not provided"}
- Bio: ${githubData.profile.bio || "Not provided"}
- Location: ${githubData.profile.location || "Not provided"}
- Company: ${githubData.profile.company || "Not provided"}
- Website: ${githubData.profile.blog || "Not provided"}
- GitHub Stats: ${githubData.profile.publicRepos} public repositories, ${githubData.profile.followers} followers, ${githubData.profile.following} following
- Member since: ${new Date(githubData.profile.createdAt).getFullYear()}

Top Programming Languages: ${Object.entries(githubData.languages)
  .sort(([, a]: any, [, b]: any) => b - a)
  .slice(0, 5)
  .map(([lang]) => lang)
  .join(", ")}

Recent Repositories:
${githubData.repositories
  .map(
    (repo: any) =>
      `- ${repo.name}: ${repo.description || "No description"} (${repo.language || "N/A"}, ⭐${repo.stars})`
  )
  .join("\n")}

Recent Activity:
${githubData.recentActivity
  .map((activity: any) => `- ${activity.type} on ${activity.repo}`)
  .join("\n")}
${readmeContents ? `\n\nProject Details from READMEs:${readmeContents}` : ""}

Answer questions about this developer based ONLY on the information provided above. Be helpful, concise, and friendly.`;

    let text;
    try {
      text = await generateContent(`${context}\n\nUser Question: ${message}`);
    } catch (error: any) {
      console.error("Gemini generation error:", error);
      return NextResponse.json(
        { error: "AI service error: " + (error?.message || "Unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
