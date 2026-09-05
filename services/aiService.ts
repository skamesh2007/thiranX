import api from "@/lib/api";
import {
  GenerateRoadmapRequest,
  AIRoadmapResponse,
  AIInsightsResponse,
} from "@/types/ai";

export const generateRoadmap = async (
  data: GenerateRoadmapRequest
): Promise<AIRoadmapResponse> => {
  const response = await api.post(
    "/ai/roadmaps/generate",
    data
  );

  return response.data;
};

export const getInsights =
  async (): Promise<AIInsightsResponse> => {
    const response = await api.post("/ai/insights");

    return response.data;
  };

export const getSavedInsights = async (): Promise<AIInsightsResponse> => {
  const response = await api.get("/ai/insights");

  return response.data;
}

// GET /ai/ask?question=... — returns a plain-text answer string.
export const askQuestion = async (question: string): Promise<string> => {
  const response = await api.get("/ai/ask", {
    params: { question },
  });

  return response.data;
};
