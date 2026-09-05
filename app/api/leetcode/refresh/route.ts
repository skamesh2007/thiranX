import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { refreshLeetCodeStatsForUser, getLeetCodeStatsForUser } from "@/lib/server/leetcode";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user.leetcode_username) throw new ApiException(400, "LeetCode username not set");

    await refreshLeetCodeStatsForUser(user.id, user.leetcode_username);
    const stats = await getLeetCodeStatsForUser(user.id);
    return NextResponse.json(stats);
  } catch (err) {
    return errorResponse(err);
  }
}
