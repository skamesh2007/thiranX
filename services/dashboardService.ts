import api from "@/lib/api"

import { CareerMomentumResponse, DashboardResponse, UpcomingTasksResponse } from "@/types/dashboard"
import { StreakResponse } from "@/types/streak"

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get("/dashboard")
  return response.data
}

export const getCareerMomentum = async (): Promise<CareerMomentumResponse> => {
  const response = await api.get("/dashboard/momentum")

  return response.data
}

export const getUpcomingTasks = async (): Promise<UpcomingTasksResponse> => {
  const response = await api.get("/dashboard/upcoming-tasks")

  return response.data
}

export const getStreak = async (): Promise<StreakResponse> => {
  const response = await api.get("/dashboard/streak")

  return response.data
}