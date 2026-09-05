import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { createRoadmapSchema } from "@/lib/server/validations";
import { errorResponse } from "@/lib/server/errors";
import { mapRoadmap } from "@/lib/server/roadmapAccess";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const { data: roadmaps, error } = await supabaseAdmin
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { data: tasks } = await supabaseAdmin
      .from("roadmap_tasks")
      .select("roadmap_id, completed")
      .in("roadmap_id", (roadmaps || []).map((r) => r.id));

    const statsByRoadmap = new Map<number, { total: number; completed: number }>();
    for (const t of tasks || []) {
      const s = statsByRoadmap.get(t.roadmap_id) || { total: 0, completed: 0 };
      s.total += 1;
      if (t.completed) s.completed += 1;
      statsByRoadmap.set(t.roadmap_id, s);
    }

    const response = (roadmaps || []).map((r) => {
      const s = statsByRoadmap.get(r.id) || { total: 0, completed: 0 };
      return mapRoadmap(r, s.total, s.completed);
    });

    return NextResponse.json(response);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = createRoadmapSchema.parse(await req.json());

    const { data: roadmap, error } = await supabaseAdmin
      .from("roadmaps")
      .insert({ user_id: user.id, title: body.title, description: body.description ?? null })
      .select("*")
      .single();
    if (error || !roadmap) throw error;

    return NextResponse.json(mapRoadmap(roadmap, 0, 0));
  } catch (err) {
    return errorResponse(err);
  }
}
