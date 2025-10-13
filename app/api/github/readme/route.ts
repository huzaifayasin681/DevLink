import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Owner and repo are required" },
      { status: 400 }
    );
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "README not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch README");
    }

    const data = await response.json();

    // Decode base64 content
    const readmeContent = Buffer.from(data.content, "base64").toString("utf-8");

    return NextResponse.json({
      content: readmeContent,
      name: data.name,
      path: data.path,
      htmlUrl: data.html_url,
    });
  } catch (error) {
    console.error("GitHub README error:", error);
    return NextResponse.json(
      { error: "Failed to fetch README" },
      { status: 500 }
    );
  }
}
