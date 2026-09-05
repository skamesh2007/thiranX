import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { getOwnedRoadmap } from "@/lib/server/roadmapAccess";
import { generateTaskResources } from "@/lib/server/aiResources";

async function loadOwnedTaskWithRoadmap(taskId: number, userId: number) {
  const { data: task, error } = await supabaseAdmin
    .from("roadmap_tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();
  if (error || !task) throw new ApiException(404, "Task not found");

  const roadmap = await getOwnedRoadmap(task.roadmap_id, userId); // throws if not owned
  return { task, roadmap };
}

async function generateAndCache(taskId: number, task: any, roadmapTitle: string) {
  const resources = await generateTaskResources(task.title, task.description, roadmapTitle);

  await supabaseAdmin
    .from("task_resources")
    .upsert(
      { task_id: taskId, resources, generated_at: new Date().toISOString() },
      { onConflict: "task_id" }
    );

  return resources;
}

// GET — returns cached resources if they exist, otherwise generates and
// caches them. Avoids a Gemini call every time the dialog is opened.
export async function GET(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { taskId } = await params;
    const { task, roadmap } = await loadOwnedTaskWithRoadmap(Number(taskId), user.id);

    const { data: cached } = await supabaseAdmin
      .from("task_resources")
      .select("resources, generated_at")
      .eq("task_id", task.id)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({ resources: cached.resources, generatedAt: cached.generated_at, cached: true });
    }

    const resources = await generateAndCache(task.id, task, roadmap.title);
    return NextResponse.json({ resources, generatedAt: new Date().toISOString(), cached: false });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST — force-regenerates resources, bypassing the cache.
export async function POST(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { taskId } = await params;
    const { task, roadmap } = await loadOwnedTaskWithRoadmap(Number(taskId), user.id);

    const resources = await generateAndCache(task.id, task, roadmap.title);
    return NextResponse.json({ resources, generatedAt: new Date().toISOString(), cached: false });
  } catch (err) {
    return errorResponse(err);
  }
}