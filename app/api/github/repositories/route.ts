import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { fetchGithubRepos } from "@/lib/server/github";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user.github_username) throw new ApiException(409, "GitHub username not configured");

    const repos = (await fetchGithubRepos(user.github_username)) || [];
    const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);

    const repositories = [...repos]
      .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        repositoryUrl: r.html_url,
      }));

    return NextResponse.json({ totalRepositories: repos.length, totalStars, repositories });
  } catch (err) {
    return errorResponse(err);
  }
}
