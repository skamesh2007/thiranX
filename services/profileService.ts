import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types/auth";

export interface UpdateProfileRequest {
  username: string;
  name: string;
  bio: string;
}

/**
 * PATCH /auth/profile
 * Updates username and display name. Returns a fresh AuthResponse
 * (with a new JWT if the username changed) and syncs the auth store.
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<AuthResponse> => {
  const response = await api.patch<AuthResponse>("/auth/profile", data);
  const updated = response.data;

  // Refresh the token in store (username in JWT subject may have changed)
  document.cookie = `token=${updated.token}; path=/; max-age=86400; SameSite=Lax`;
  useAuthStore.getState().login(updated.token, {
    username: updated.username,
    email: updated.email,
    name: updated.name,
    bio: updated.bio,
    role: updated.role,
  });

  return updated;
};