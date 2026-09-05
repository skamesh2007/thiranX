import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";
import { getOwnedRoadmap } from "@/lib/server/roadmapAccess";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const roadmap = await getOwnedRoadmap(Number(id), user.id);

    const { data: tasks, error } = await supabaseAdmin
      .from("roadmap_tasks")
      .select("*")
      .eq("roadmap_id", roadmap.id);
    if (error) throw error;

    const all = tasks || [];
    const today = new Date().toISOString().slice(0, 10);

    const totalTasks = all.length;
    const completedTasks = all.filter((t) => t.completed).length;
    const remainingTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks === 0 ? 0 : Math.floor((completedTasks * 100) / totalTasks);

    const overdueTasks = all.filter((t) => !t.completed && t.due_date && t.due_date < today).length;
    const highPriorityRemaining = all.filter((t) => !t.completed && t.priority === "HIGH").length;
    const estimatedHoursRemaining = all
      .filter((t) => !t.completed)
      .reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

    const priorityRank = (p: string) => (p === "HIGH" ? 0 : 1);
    const recommendations = all
      .filter((t) => !t.completed)
      .sort((a, b) => {
        const p = priorityRank(a.priority) - priorityRank(b.priority);
        if (p !== 0) return p;
        const da = a.due_date || "9999-12-31";
        const db = b.due_date || "9999-12-31";
        if (da !== db) return da < db ? -1 : 1;
        return a.id - b.id;
      })
      .slice(0, 3)
      .map((t) => ({
        taskId: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.due_date,
        estimatedHours: t.estimated_hours,
      }));

    return NextResponse.json({
      roadmapId: roadmap.id,
      roadmapTitle: roadmap.title,
      completionPercentage,
      completedTasks,
      remainingTasks,
      overdueTasks,
      highPriorityRemaining,
      estimatedHoursRemaining,
      projectedCompletionDays: -1,
      nextRecommendedTasks: recommendations,
    });
  } catch (err) {
    return errorResponse(err);
  }
}