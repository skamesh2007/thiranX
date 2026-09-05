import api from "@/lib/api";
import { Todo, CreateTodoRequest, UpdateTodoRequest } from "@/types/todo";

export const getTodos = async (): Promise<Todo[]> => {
  const response = await api.get("/todos");
  return response.data;
};

export const createTodo = async (data: CreateTodoRequest): Promise<Todo> => {
  const response = await api.post("/todos", data);
  return response.data;
};

export const updateTodo = async (
  id: number,
  data: UpdateTodoRequest
): Promise<Todo> => {
  const response = await api.put(`/todos/${id}`, data);
  return response.data;
};

export const deleteTodo = async (id: number): Promise<void> => {
  await api.delete(`/todos/${id}`);
};