import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { leetcodeUsernameSchema } from "@/lib/server/validations";
import { errorResponse } from "@/lib/server/errors";
import { refreshLeetCodeStatsForUser } from "@/lib/server/leetcode";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    return NextResponse.json({ username: user.leetcode_username });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = leetcodeUsernameSchema.parse(await req.json());

    if (!body.leetcodeUsername || !body.leetcodeUsername.trim()) {
      await supabaseAdmin.from("users").update({ leetcode_username: null }).eq("id", user.id);
      await supabaseAdmin.from("leetcode_stats").delete().eq("user_id", user.id);
      return NextResponse.json("LeetCode username removed");
    }

    const username = body.leetcodeUsername.trim();
    await supabaseAdmin.from("users").update({ leetcode_username: username }).eq("id", user.id);
    await refreshLeetCodeStatsForUser(user.id, username);

    return NextResponse.json("LeetCode username saved");
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await supabaseAdmin.from("users").update({ leetcode_username: null }).eq("id", user.id);
    await supabaseAdmin.from("leetcode_stats").delete().eq("user_id", user.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
