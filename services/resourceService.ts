import api from "@/lib/api";
import { TaskResourcesResponse } from "@/types/resources";

export const getTaskResources = async (
  taskId: number
): Promise<TaskResourcesResponse> => {
  const response = await api.get(`/roadmaps/tasks/${taskId}/resources`);
  return response.data;
};

export const refreshTaskResources = async (
  taskId: number
): Promise<TaskResourcesResponse> => {
  const response = await api.post(`/roadmaps/tasks/${taskId}/resources`);
  return response.data;
};