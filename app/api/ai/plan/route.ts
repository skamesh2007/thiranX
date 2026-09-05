import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { aiPlanSchema } from "@/lib/server/validations";
import { errorResponse } from "@/lib/server/errors";
import { generateAiPlan, PlannableItem } from "@/lib/server/aiPlanner";

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { days = 7 } = aiPlanSchema.parse(await req.json().catch(() => ({})));

    const { data: roadmaps } = await supabaseAdmin
      .from("roadmaps")
      .select("id")
      .eq("user_id", user.id);
    const roadmapIds = (roadmaps || []).map((r) => r.id);

    const { data: undatedTasks } = roadmapIds.length
      ? await supabaseAdmin
          .from("roadmap_tasks")
          .select("id, title, priority, estimated_hours")
          .in("roadmap_id", roadmapIds)
          .eq("completed", false)
          .is("due_date", null)
      : { data: [] as any[] };

    const { data: undatedTodos } = await supabaseAdmin
      .from("todos")
      .select("id, title, priority")
      .eq("user_id", user.id)
      .eq("completed", false)
      .is("due_date", null);

    const items: PlannableItem[] = [
      ...(undatedTasks || []).map((t) => ({
        kind: "roadmap_task" as const,
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedHours: t.estimated_hours || 2,
      })),
      ...(undatedTodos || []).map((t) => ({
        kind: "todo" as const,
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedHours: 1,
      })),
    ];

    if (items.length === 0) {
      return NextResponse.json({ scheduled: 0, days: [] });
    }

    const assignments = await generateAiPlan(items, days);

    const taskIdsByDate = new Map<string, number[]>();
    const todoIdsByDate = new Map<string, number[]>();

    for (const a of assignments) {
      const date = addDays(a.dayOffset);
      const map = a.kind === "roadmap_task" ? taskIdsByDate : todoIdsByDate;
      const list = map.get(date) || [];
      list.push(a.id);
      map.set(date, list);
    }

    for (const [date, ids] of taskIdsByDate) {
      await supabaseAdmin.from("roadmap_tasks").update({ due_date: date }).in("id", ids);
    }
    for (const [date, ids] of todoIdsByDate) {
      await supabaseAdmin.from("todos").update({ due_date: date }).in("id", ids);
    }

    const itemById = new Map(items.map((i) => [`${i.kind}:${i.id}`, i]));
    const byDate = new Map<string, { kind: string; id: number; title: string }[]>();
    for (const a of assignments) {
      const date = addDays(a.dayOffset);
      const item = itemById.get(`${a.kind}:${a.id}`);
      if (!item) continue;
      const list = byDate.get(date) || [];
      list.push({ kind: a.kind, id: a.id, title: item.title });
      byDate.set(date, list);
    }

    const daysOut = Array.from(byDate.entries())
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    return NextResponse.json({ scheduled: assignments.length, days: daysOut });
  } catch (err) {
    return errorResponse(err);
  }
}