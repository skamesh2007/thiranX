import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";

function momentumScore(completed: number, total: number, overdue: number) {
  if (total === 0) return 0;
  const completionScore = Math.floor((completed * 100) / total);
  const overduePenalty = Math.min(overdue * 5, 30);
  return Math.max(completionScore - overduePenalty, 0);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const { data: roadmaps } = await supabaseAdmin.from("roadmaps").select("*").eq("user_id", user.id);

    if (!roadmaps || roadmaps.length === 0) {
      return NextResponse.json({
        strongestRoadmap: "No roadmaps yet",
        strongestRoadmapProgress: 0,
        weakestRoadmap: "No roadmaps yet",
        weakestRoadmapProgress: 0,
        totalOverdueTasks: 0,
        nearestCompletionRoadmap: "No roadmaps yet",
        nearestCompletionPercentage: 0,
        momentumScore: 0,
      });
    }

    const roadmapIds = roadmaps.map((r) => r.id);
    const { data: tasks } = await supabaseAdmin
      .from("roadmap_tasks")
      .select("*")
      .in("roadmap_id", roadmapIds);

    const today = new Date().toISOString().slice(0, 10);
    const byRoadmap = new Map<number, any[]>();
    for (const t of tasks || []) {
      const list = byRoadmap.get(t.roadmap_id) || [];
      list.push(t);
      byRoadmap.set(t.roadmap_id, list);
    }

    let strongest: { title: string; progress: number } | null = null;
    let weakest: { title: string; progress: number } | null = null;
    let nearest: { title: string; progress: number } | null = null;
    let totalOverdue = 0,
      totalCompleted = 0,
      totalTasks = 0;

    for (const roadmap of roadmaps) {
      const roadmapTasks = byRoadmap.get(roadmap.id) || [];
      const total = roadmapTasks.length;
      const completed = roadmapTasks.filter((t) => t.completed).length;
      const progress = total === 0 ? 0 : Math.floor((completed * 100) / total);
      const overdue = roadmapTasks.filter((t) => !t.completed && t.due_date && t.due_date < today).length;

      totalTasks += total;
      totalCompleted += completed;
      totalOverdue += overdue;

      if (!strongest || progress > strongest.progress) strongest = { title: roadmap.title, progress };
      if (!weakest || progress < weakest.progress) weakest = { title: roadmap.title, progress };
      // "Nearest to completion" — the highest-progress roadmap overall.
      // Not restricted to <100% so a fully-complete roadmap still shows
      // up here instead of leaving this field null.
      if (!nearest || progress > nearest.progress) nearest = { title: roadmap.title, progress };
    }

    return NextResponse.json({
      strongestRoadmap: strongest!.title,
      strongestRoadmapProgress: strongest!.progress,
      weakestRoadmap: weakest!.title,
      weakestRoadmapProgress: weakest!.progress,
      totalOverdueTasks: totalOverdue,
      nearestCompletionRoadmap: nearest!.title,
      nearestCompletionPercentage: nearest!.progress,
      momentumScore: momentumScore(totalCompleted, totalTasks, totalOverdue),
    });
  } catch (err) {
    return errorResponse(err);
  }
}