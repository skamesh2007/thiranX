import api from "@/lib/api";

import { RoadmapTask } from "@/types/roadmap";
import { CreateTaskRequest, UpdateTaskRequest } from "@/types/task";

export const getTasks = async (
  roadmapId: number
): Promise<RoadmapTask[]> => {
  const response = await api.get(
    `/roadmaps/${roadmapId}/tasks`
  );

  return response.data;
};

export const createTask = async (
  roadmapId: number,
  data: CreateTaskRequest
): Promise<RoadmapTask> => {
  const response = await api.post(
    `/roadmaps/${roadmapId}/tasks`,
    data
  );

  return response.data;
};

export const updateTask = async (
  taskId: number,
  data: UpdateTaskRequest
): Promise<RoadmapTask> => {
  const response = await api.put(
    `/roadmaps/tasks/${taskId}`,
    data
  );

  return response.data;
};

export const deleteTask = async (
  taskId: number
): Promise<void> => {
  await api.delete(`/roadmaps/tasks/${taskId}`);
};