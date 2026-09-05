import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { createTaskSchema } from "@/lib/server/validations";
import { errorResponse } from "@/lib/server/errors";
import { getOwnedRoadmap, mapTask } from "@/lib/server/roadmapAccess";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const roadmap = await getOwnedRoadmap(Number(id), user.id);

    const { data: tasks, error } = await supabaseAdmin
      .from("roadmap_tasks")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .order("created_at", { ascending: true });
    if (error) throw error;

    return NextResponse.json((tasks || []).map(mapTask));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const roadmap = await getOwnedRoadmap(Number(id), user.id);
    const body = createTaskSchema.parse(await req.json());

    const { data: task, error } = await supabaseAdmin
      .from("roadmap_tasks")
      .insert({
        roadmap_id: roadmap.id,
        title: body.title,
        description: body.description ?? null,
        completed: false,
      })
      .select("*")
      .single();
    if (error || !task) throw error;

    return NextResponse.json(mapTask(task));
  } catch (err) {
    return errorResponse(err);
  }
}