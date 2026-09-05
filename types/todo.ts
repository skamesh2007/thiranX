export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TodoPriority;
  completed: boolean;
}

export interface CreateTodoRequest {
  title: string;
  description?: string | null;
  priority?: TodoPriority;
  dueDate?: string | null;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string | null;
  priority?: TodoPriority;
  dueDate?: string | null;
  completed?: boolean;
}