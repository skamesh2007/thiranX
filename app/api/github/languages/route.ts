import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { fetchGithubRepos } from "@/lib/server/github";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user.github_username) throw new ApiException(409, "GitHub username not configured");

    const repos = (await fetchGithubRepos(user.github_username)) || [];
    const counts = new Map<string, number>();
    for (const r of repos) {
      if (r.language) counts.set(r.language, (counts.get(r.language) || 0) + 1);
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);

    const languages = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([language, repositoryCount]) => ({
        language,
        repositoryCount,
        percentage: total === 0 ? 0 : (repositoryCount * 100) / total,
      }));

    return NextResponse.json({ languages });
  } catch (err) {
    return errorResponse(err);
  }
}
