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

async function generateAndMaybeCache(taskId: number, task: any, roadmapTitle: string) {
  const result = await generateTaskResources(task.title, task.description, roadmapTitle);

  // Only cache genuine AI output. Caching a fallback would permanently
  // serve generic placeholders even after the underlying AI issue is
  // fixed — better to retry generation on the next request instead.
  if (result.source === "ai") {
    await supabaseAdmin
      .from("task_resources")
      .upsert(
        { task_id: taskId, resources: result.resources, generated_at: new Date().toISOString() },
        { onConflict: "task_id" }
      );
  }

  return result;
}

// GET — returns cached resources if they exist, otherwise generates
// them. Avoids a Gemini call every time the dialog is opened.
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
      return NextResponse.json({
        resources: cached.resources,
        generatedAt: cached.generated_at,
        cached: true,
        source: "ai",
      });
    }

    const result = await generateAndMaybeCache(task.id, task, roadmap.title);
    return NextResponse.json({
      resources: result.resources,
      generatedAt: new Date().toISOString(),
      cached: false,
      source: result.source,
    });
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

    const result = await generateAndMaybeCache(task.id, task, roadmap.title);
    return NextResponse.json({
      resources: result.resources,
      generatedAt: new Date().toISOString(),
      cached: false,
      source: result.source,
    });
  } catch (err) {
    return errorResponse(err);
  }
}