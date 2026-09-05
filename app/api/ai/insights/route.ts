import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { generateInsights } from "@/lib/server/aiInsights";

async function buildRoadmapMetrics(userId: number) {
  const { data: roadmaps } = await supabaseAdmin.from("roadmaps").select("*").eq("user_id", userId);
  const roadmapIds = (roadmaps || []).map((r) => r.id);

  const { data: tasks } = roadmapIds.length
    ? await supabaseAdmin.from("roadmap_tasks").select("*").in("roadmap_id", roadmapIds)
    : { data: [] as any[] };

  const today = new Date().toISOString().slice(0, 10);
  const byRoadmap = new Map<number, any[]>();
  for (const t of tasks || []) {
    const list = byRoadmap.get(t.roadmap_id) || [];
    list.push(t);
    byRoadmap.set(t.roadmap_id, list);
  }

  let summary = "";
  let totalTasks = 0, completedTasks = 0, overdueTasks = 0, highPriorityPendingTasks = 0;

  for (const roadmap of roadmaps || []) {
    const roadmapTasks = byRoadmap.get(roadmap.id) || [];
    const total = roadmapTasks.length;
    const completed = roadmapTasks.filter((t) => t.completed).length;
    const overdue = roadmapTasks.filter((t) => !t.completed && t.due_date && t.due_date < today).length;
    const highPending = roadmapTasks.filter((t) => !t.completed && t.priority === "HIGH").length;
    const progress = total === 0 ? 0 : Math.floor((completed * 100) / total);

    summary += `${roadmap.title} - ${progress}%, completed ${completed}/${total}, overdue ${overdue}, high priority pending ${highPending}\n`;

    totalTasks += total;
    completedTasks += completed;
    overdueTasks += overdue;
    highPriorityPendingTasks += highPending;
  }

  return { summary, totalTasks, completedTasks, overdueTasks, highPriorityPendingTasks };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { summary, totalTasks, completedTasks, overdueTasks, highPriorityPendingTasks } =
      await buildRoadmapMetrics(user.id);

    const insights = await generateInsights(summary, totalTasks, completedTasks, overdueTasks, highPriorityPendingTasks);

    await supabaseAdmin
      .from("ai_insights")
      .upsert(
        { user_id: user.id, strengths: insights.strengths, weaknesses: insights.weaknesses, next_actions: insights.nextActions },
        { onConflict: "user_id" }
      );

    return NextResponse.json(insights);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const { data, error } = await supabaseAdmin
      .from("ai_insights")
      .select("strengths, weaknesses, next_actions")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) throw new ApiException(404, "No AI insights found");

    return NextResponse.json({
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      nextActions: data.next_actions,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
