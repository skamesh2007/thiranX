import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { fetchGithubRepos } from "@/lib/server/github";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user.github_username) throw new ApiException(409, "GitHub username not configured");

    const repos = (await fetchGithubRepos(user.github_username)) || [];
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const updatedLast30Days = repos.filter((r: any) => r.updated_at && new Date(r.updated_at).getTime() > thirtyDaysAgo).length;
    const createdLast30Days = repos.filter((r: any) => r.created_at && new Date(r.created_at).getTime() > thirtyDaysAgo).length;

    const mostRecent = repos.reduce((best: any, r: any) => {
      if (!r.pushed_at) return best;
      if (!best || new Date(r.pushed_at) > new Date(best.pushed_at)) return r;
      return best;
    }, null);

    return NextResponse.json({
      repositoriesUpdatedLast30Days: updatedLast30Days,
      repositoriesCreatedLast30Days: createdLast30Days,
      activeRepositories: updatedLast30Days,
      mostRecentlyUpdatedRepository: mostRecent?.name ?? null,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
