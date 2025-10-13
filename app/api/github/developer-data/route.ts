import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    const userRes = await fetch(`${GITHUB_API}/users/${username}`, { headers });
    if (!userRes.ok) throw new Error("User not found");
    const user = await userRes.json();

    const reposRes = await fetch(
      `${GITHUB_API}/users/${username}/repos?sort=updated&per_page=10`,
      { headers }
    );
    const repos = await reposRes.json();

    const eventsRes = await fetch(
      `${GITHUB_API}/users/${username}/events/public?per_page=10`,
      { headers }
    );
    const events = await eventsRes.json();

    const languages: Record<string, number> = {};
    repos.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const data = {
      profile: {
        name: user.name,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        createdAt: user.created_at,
      },
      repositories: repos.slice(0, 10).map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
      })),
      languages,
      recentActivity: events.slice(0, 5).map((event: any) => ({
        type: event.type,
        repo: event.repo?.name,
        createdAt: event.created_at,
      })),
    };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
