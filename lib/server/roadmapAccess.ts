import { supabaseAdmin } from "./supabaseAdmin";
import { ApiException } from "./errors";

/** Loads a roadmap and verifies it belongs to the given user. */
export async function getOwnedRoadmap(roadmapId: number, userId: number) {
  const { data: roadmap, error } = await supabaseAdmin
    .from("roadmaps")
    .select("*")
    .eq("id", roadmapId)
    .maybeSingle();

  if (error || !roadmap) throw new ApiException(404, "Roadmap not found");
  if (roadmap.user_id !== userId) throw new ApiException(403, "Access denied");

  return roadmap;
}

export function mapRoadmap(roadmap: any, totalTasks: number, completedTasks: number) {
  const progress = totalTasks === 0 ? 0 : Math.floor((completedTasks * 100) / totalTasks);
  return {
    id: roadmap.id,
    title: roadmap.title,
    description: roadmap.description,
    totalTasks,
    completedTasks,
    progress,
  };
}

export function mapTask(task: any) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
  };
}
