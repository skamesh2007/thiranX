import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";
import { getLeetCodeStatsForUser } from "@/lib/server/leetcode";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const stats = await getLeetCodeStatsForUser(user.id);
    return NextResponse.json(stats);
  } catch (err) {
    return errorResponse(err);
  }
}
