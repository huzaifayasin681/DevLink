import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { projectName, technologies, githubUrl, existingDescription } = await request.json();

    if (!projectName) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Fetch README if GitHub URL provided
    let readmeContent = "";
    if (githubUrl) {
      try {
        const urlParts = githubUrl.replace("https://github.com/", "").split("/");
        if (urlParts.length >= 2) {
          const owner = urlParts[0];
          const repo = urlParts[1];
          
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
          const readmeRes = await fetch(
            `${baseUrl}/api/github/readme?owner=${owner}&repo=${repo}`,
            { cache: "no-store" }
          );
          
          if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            readmeContent = readmeData.content;
          }
        }
      } catch (error) {
        console.error("Failed to fetch README:", error);
      }
    }

    const prompt = `Generate a compelling, professional project description for a developer portfolio.

Project Name: ${projectName}
Technologies: ${technologies?.join(", ") || "Not specified"}
${githubUrl ? `GitHub URL: ${githubUrl}` : ""}
${existingDescription ? `Current Description: ${existingDescription}` : ""}
${readmeContent ? `\n\nREADME Content:\n${readmeContent.substring(0, 2000)}` : ""}

Generate:
1. A catchy title (if different from project name, suggest improvement)
2. A compelling 2-3 sentence description (50-100 words)
3. 5-7 relevant tags/keywords for SEO
4. A brief feature list (3-5 key features)

Format as JSON:
{
  "title": "suggested title",
  "description": "compelling description",
  "tags": ["tag1", "tag2", ...],
  "features": ["feature1", "feature2", ...]
}`;

    const text = await generateContent(prompt);
    
    if (!text) {
      throw new Error("No response from AI");
    }
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
