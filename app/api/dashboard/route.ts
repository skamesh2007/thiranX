import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";
import { getLeetCodeStatsForUser } from "@/lib/server/leetcode";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const { data: roadmaps } = await supabaseAdmin.from("roadmaps").select("id").eq("user_id", user.id);
    const roadmapIds = (roadmaps || []).map((r) => r.id);

    let totalTasks = 0;
    let completedTasks = 0;

    if (roadmapIds.length > 0) {
      const { data: tasks } = await supabaseAdmin
        .from("roadmap_tasks")
        .select("completed")
        .in("roadmap_id", roadmapIds);
      totalTasks = tasks?.length || 0;
      completedTasks = tasks?.filter((t) => t.completed).length || 0;
    }

    const roadmapProgress = totalTasks === 0 ? 0 : Math.floor((completedTasks * 100) / totalTasks);

    let leetcodeSolved = 0;
    try {
      const stats = await getLeetCodeStatsForUser(user.id);
      leetcodeSolved = stats?.totalSolved || 0;
    } catch {
      // no linked LeetCode account
    }

    return NextResponse.json({
      roadmapProgress,
      completedTasks,
      totalTasks,
      activeProjects: 0,
      leetcodeSolved,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
