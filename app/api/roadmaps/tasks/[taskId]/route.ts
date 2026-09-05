import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { updateTaskSchema } from "@/lib/server/validations";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { getOwnedRoadmap, mapTask } from "@/lib/server/roadmapAccess";

async function loadOwnedTask(taskId: number, userId: number) {
  const { data: task, error } = await supabaseAdmin
    .from("roadmap_tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();
  if (error || !task) throw new ApiException(404, "Task not found");

  await getOwnedRoadmap(task.roadmap_id, userId); // throws if not owned
  return task;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { taskId } = await params;
    const task = await loadOwnedTask(Number(taskId), user.id);
    const body = updateTaskSchema.parse(await req.json());

    const update: Record<string, unknown> = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.completed !== undefined) {
      update.completed = body.completed;
      update.completed_at = body.completed ? new Date().toISOString() : null;
    }

    const { data: updated, error } = await supabaseAdmin
      .from("roadmap_tasks")
      .update(update)
      .eq("id", task.id)
      .select("*")
      .single();
    if (error || !updated) throw error;

    return NextResponse.json(mapTask(updated));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { taskId } = await params;
    const task = await loadOwnedTask(Number(taskId), user.id);
    await supabaseAdmin.from("roadmap_tasks").delete().eq("id", task.id);
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}