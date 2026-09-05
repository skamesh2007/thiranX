import api from "@/lib/api";
import { CalendarMonthResponse, AiPlanResponse } from "@/types/calendar";

// month: "YYYY-MM"
export const getCalendarMonth = async (
  month: string
): Promise<CalendarMonthResponse> => {
  const response = await api.get("/calendar", { params: { month } });
  return response.data;
};

export const generateAiPlan = async (days = 7): Promise<AiPlanResponse> => {
  const response = await api.post("/ai/plan", { days });
  return response.data;
};