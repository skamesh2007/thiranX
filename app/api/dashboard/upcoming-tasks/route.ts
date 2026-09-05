import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";

const priorityRank = (p: string) => (p === "HIGH" ? 0 : p === "MEDIUM" ? 1 : 2);

// Top pending tasks across every roadmap the user has, surfaced on the
// dashboard so there's always something actionable to look at instead
// of just progress percentages. Overdue tasks first, then soonest due
// date, then priority.
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const { data: roadmaps } = await supabaseAdmin
      .from("roadmaps")
      .select("id, title")
      .eq("user_id", user.id);

    const roadmapIds = (roadmaps || []).map((r) => r.id);
    if (roadmapIds.length === 0) return NextResponse.json({ tasks: [] });

    const titleById = new Map((roadmaps || []).map((r) => [r.id, r.title]));

    const { data: tasks, error } = await supabaseAdmin
      .from("roadmap_tasks")
      .select("id, roadmap_id, title, due_date, priority")
      .in("roadmap_id", roadmapIds)
      .eq("completed", false);
    if (error) throw error;

    const today = new Date().toISOString().slice(0, 10);

    const sorted = (tasks || [])
      .map((t) => ({
        taskId: t.id,
        roadmapId: t.roadmap_id,
        roadmapTitle: titleById.get(t.roadmap_id) ?? "Untitled Roadmap",
        title: t.title,
        dueDate: t.due_date,
        priority: t.priority,
        overdue: Boolean(t.due_date && t.due_date < today),
      }))
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        const da = a.dueDate || "9999-12-31";
        const db = b.dueDate || "9999-12-31";
        if (da !== db) return da < db ? -1 : 1;
        return priorityRank(a.priority) - priorityRank(b.priority);
      })
      .slice(0, 6);

    return NextResponse.json({ tasks: sorted });
  } catch (err) {
    return errorResponse(err);
  }
}