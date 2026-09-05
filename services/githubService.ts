import api from "@/lib/api"

import {
  GitHubStatsResponse,
  GitHubUsernameResponse,
  GitHubRepositoriesResponse,
  GitHubActivityResponse,
} from "@/types/github"

export interface GitHubUsernameRequest {
  githubUsername: string
}

export const getGitHubUsername = async (): Promise<GitHubUsernameResponse> => {
  const response = await api.get("/github/username")

  return response.data
}

export const saveGitHubUsername = async (
  data: GitHubUsernameRequest
): Promise<GitHubUsernameResponse> => {
  const response = await api.post("/github/username", data)

  return response.data
}

export const getGitHubStats = async (): Promise<GitHubStatsResponse> => {
  const response = await api.get("/github/stats")

  return response.data
}
export const getGitHubRepositories =
  async (): Promise<GitHubRepositoriesResponse> => {
    const response = await api.get("/github/repositories")

    return response.data
  }

export const getGitHubActivity = async (): Promise<GitHubActivityResponse> => {
  const response = await api.get("/github/activity")

  return response.data
}
