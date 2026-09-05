import api from "@/lib/api";
import {
  LeetCodeStatsResponse,
  LeetCodeUsernameRequest,
  LeetCodeUsernameResponse,
} from "@/types/leetcode";

export const saveLeetCodeUsername = async (
  data: LeetCodeUsernameRequest
) => {
  const response = await api.post("/leetcode/username", data);
  return response.data;
};

export const getLeetCodeUsername = async (): Promise<LeetCodeUsernameResponse> => {
  const response = await api.get("/leetcode/username");
  return response.data;
};

export const removeLeetCodeUsername = async () => {
  await api.delete("/leetcode/username");
};

export const getMyLeetCodeStats =
  async (): Promise<LeetCodeStatsResponse> => {
    const response = await api.get("/leetcode/me");
    return response.data;
  };

export const getLeetCodeStatsByUsername =
  async (username: string): Promise<LeetCodeStatsResponse> => {
    const response = await api.get(`/leetcode/${username}`);
    return response.data;
  };

export const refreshLeetCodeStats = async (): Promise<LeetCodeStatsResponse> => {
  const response = await api.post("/leetcode/refresh");
  return response.data;
}