import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { updateTodoSchema } from "@/lib/server/validations";
import { ApiException, errorResponse } from "@/lib/server/errors";

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

async function loadOwnedTodo(id: number, userId: number) {
  const { data: todo, error } = await supabaseAdmin
    .from("todos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !todo) throw new ApiException(404, "Todo not found");
  if (todo.user_id !== userId) throw new ApiException(403, "Access denied");
  return todo;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const todo = await loadOwnedTodo(Number(id), user.id);
    const body = updateTodoSchema.parse(await req.json());

    const update: Record<string, unknown> = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.priority !== undefined) update.priority = body.priority;
    if (body.dueDate !== undefined) update.due_date = body.dueDate;
    if (body.completed !== undefined) {
      update.completed = body.completed;
      update.completed_at = body.completed ? new Date().toISOString() : null;
    }

    const { data: updated, error } = await supabaseAdmin
      .from("todos")
      .update(update)
      .eq("id", todo.id)
      .select("*")
      .single();
    if (error || !updated) throw error;

    return NextResponse.json(mapTodo(updated));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    const { id } = await params;
    const todo = await loadOwnedTodo(Number(id), user.id);
    await supabaseAdmin.from("todos").delete().eq("id", todo.id);
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}