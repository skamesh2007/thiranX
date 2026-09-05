import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";

// GET /api/calendar?month=YYYY-MM
// Returns every roadmap task + standalone todo due within that month,
// grouped by date, so the calendar page needs one request per month
// instead of stitching together /roadmaps + /todos client-side.
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const month = req.nextUrl.searchParams.get("month"); // "YYYY-MM"
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new ApiException(400, "month must be in YYYY-MM format");
    }

    const start = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const end = new Date(y, m, 0).toISOString().slice(0, 10); // last day of month

    const { data: roadmaps } = await supabaseAdmin
      .from("roadmaps")
      .select("id, title")
      .eq("user_id", user.id);
    const roadmapIds = (roadmaps || []).map((r) => r.id);
    const titleById = new Map((roadmaps || []).map((r) => [r.id, r.title]));

    const { data: roadmapTasks } = roadmapIds.length
      ? await supabaseAdmin
          .from("roadmap_tasks")
          .select("id, roadmap_id, title, due_date, priority, completed")
          .in("roadmap_id", roadmapIds)
          .gte("due_date", start)
          .lte("due_date", end)
      : { data: [] as any[] };

    const { data: todos } = await supabaseAdmin
      .from("todos")
      .select("id, title, due_date, priority, completed")
      .eq("user_id", user.id)
      .gte("due_date", start)
      .lte("due_date", end);

    const byDate = new Map<string, any[]>();

    for (const t of roadmapTasks || []) {
      const list = byDate.get(t.due_date) || [];
      list.push({
        kind: "roadmap_task",
        id: t.id,
        title: t.title,
        priority: t.priority,
        completed: t.completed,
        roadmapId: t.roadmap_id,
        roadmapTitle: titleById.get(t.roadmap_id) ?? "Untitled Roadmap",
      });
      byDate.set(t.due_date, list);
    }

    for (const t of todos || []) {
      const list = byDate.get(t.due_date) || [];
      list.push({
        kind: "todo",
        id: t.id,
        title: t.title,
        priority: t.priority,
        completed: t.completed,
      });
      byDate.set(t.due_date, list);
    }

    const days = Array.from(byDate.entries())
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    return NextResponse.json({ month, days });
  } catch (err) {
    return errorResponse(err);
  }
}