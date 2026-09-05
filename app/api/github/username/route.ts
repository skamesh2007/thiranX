import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { githubUsernameSchema } from "@/lib/server/validations";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { fetchGithubProfile } from "@/lib/server/github";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    return NextResponse.json({ githubUsername: user.github_username });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = githubUsernameSchema.parse(await req.json());

    if (!body.githubUsername || !body.githubUsername.trim()) {
      await supabaseAdmin.from("users").update({ github_username: null }).eq("id", user.id);
      return NextResponse.json({ githubUsername: null });
    }

    const username = body.githubUsername.trim();
    const profile = await fetchGithubProfile(username);
    if (!profile) throw new ApiException(400, "GitHub user not found");

    await supabaseAdmin.from("users").update({ github_username: username }).eq("id", user.id);
    return NextResponse.json({ githubUsername: username });
  } catch (err) {
    return errorResponse(err);
  }
}
