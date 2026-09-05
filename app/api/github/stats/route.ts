import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { fetchGithubProfile, fetchGithubRepos } from "@/lib/server/github";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user.github_username) throw new ApiException(409, "GitHub username not configured");

    const [profile, repos] = await Promise.all([
      fetchGithubProfile(user.github_username),
      fetchGithubRepos(user.github_username),
    ]);
    if (!profile) throw new ApiException(404, "GitHub user not found");

    const totalStars = (repos || []).reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);

    return NextResponse.json({
      username: user.github_username,
      profileUrl: profile.html_url,
      avatarUrl: profile.avatar_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      totalStars,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
