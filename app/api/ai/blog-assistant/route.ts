import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const { action, topic, content, title } = await request.json();

    let prompt = "";

    if (action === "generate-outline") {
      prompt = `Generate a comprehensive blog post outline for: "${topic}"

Create a detailed outline with:
1. A catchy, SEO-friendly title
2. An engaging introduction hook
3. 5-7 main sections with subsections
4. A conclusion
5. 5-8 relevant tags/keywords

Format as JSON:
{
  "title": "suggested title",
  "introduction": "hook paragraph",
  "sections": [
    {"heading": "Section 1", "points": ["point1", "point2"]},
    ...
  ],
  "conclusion": "conclusion paragraph",
  "tags": ["tag1", "tag2", ...],
  "metaDescription": "SEO meta description"
}`;
    } else if (action === "improve-content") {
      prompt = `Improve this blog post content. Make it more engaging, fix grammar, and enhance readability:

Title: ${title}
Content:
${content}

Return the improved content as plain text, maintaining markdown formatting.`;
    } else if (action === "generate-tags") {
      prompt = `Analyze this blog post and suggest relevant tags/keywords:

Title: ${title}
Content: ${content?.substring(0, 500)}...

Generate 5-8 relevant tags as JSON:
{
  "tags": ["tag1", "tag2", ...]
}`;
    } else if (action === "generate-meta") {
      prompt = `Generate SEO-optimized metadata for this blog post:

Title: ${title}
Content: ${content?.substring(0, 500)}...

Format as JSON:
{
  "metaTitle": "SEO title (60 chars max)",
  "metaDescription": "SEO description (155 chars max)",
  "slug": "url-friendly-slug"
}`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const text = await generateContent(prompt);

    if (action === "improve-content") {
      return NextResponse.json({ content: text || "" });
    }

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
      { error: error?.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
