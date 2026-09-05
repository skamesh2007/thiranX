import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { createTodoSchema } from "@/lib/server/validations";
import { errorResponse } from "@/lib/server/errors";

function mapTodo(todo: any) {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    dueDate: todo.due_date,
    priority: todo.priority,
    completed: todo.completed,
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const { data: todos, error } = await supabaseAdmin
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json((todos || []).map(mapTodo));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = createTodoSchema.parse(await req.json());

    const { data: todo, error } = await supabaseAdmin
      .from("todos")
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description ?? null,
        priority: body.priority ?? "MEDIUM",
        due_date: body.dueDate ?? null,
        completed: false,
      })
      .select("*")
      .single();
    if (error || !todo) throw error;

    return NextResponse.json(mapTodo(todo));
  } catch (err) {
    return errorResponse(err);
  }
}