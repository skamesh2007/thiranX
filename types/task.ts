import { TaskPriority } from "@/types/roadmap";

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: string | null;
}