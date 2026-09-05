import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { updateRoadmapSchema } from "@/lib/server/validations";
import { errorResponse } from "@/lib/server/errors";
import { getOwnedRoadmap, mapRoadmap } from "@/lib/server/roadmapAccess";

async function taskStats(roadmapId: number) {
  const { data: tasks } = await supabaseAdmin
    .from("roadmap_tasks")
    .select("completed")
    .eq("roadmap_id", roadmapId);
  const total = tasks?.length || 0;
  const completed = tasks?.filter((t) => t.completed).length || 0;
  return { total, completed };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const roadmap = await getOwnedRoadmap(Number(id), user.id);
    const { total, completed } = await taskStats(roadmap.id);
    return NextResponse.json(mapRoadmap(roadmap, total, completed));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const roadmap = await getOwnedRoadmap(Number(id), user.id);
    const body = updateRoadmapSchema.parse(await req.json());

    const { data: updated, error } = await supabaseAdmin
      .from("roadmaps")
      .update({ title: body.title, description: body.description ?? null })
      .eq("id", roadmap.id)
      .select("*")
      .single();
    if (error || !updated) throw error;

    const { total, completed } = await taskStats(roadmap.id);
    return NextResponse.json(mapRoadmap(updated, total, completed));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const roadmap = await getOwnedRoadmap(Number(id), user.id);
    await supabaseAdmin.from("roadmaps").delete().eq("id", roadmap.id);
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}