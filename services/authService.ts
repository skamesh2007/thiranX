import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth"

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data)
  return response.data
}

export const register = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data)
  return response.data
}

/**
 * Validates the stored JWT against the backend and returns fresh user data.
 * Called on app init to confirm the token hasn't expired.
 */
export const getMe = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>("/auth/me")
  return response.data
}

/**
 * Logs out the user:
 * 1. Clears Zustand state (removes from localStorage via persist middleware)
 * 2. Clears the JWT cookie used by Next.js middleware for SSR route protection
 */
export const logout = (): void => {
  useAuthStore.getState().logout()

  // Expire the cookie — must match the path and domain it was set with
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax"
}

export const changePassword = async (data: ChangePasswordRequest) => {
  const response = await api.post("/auth/change-password", data)

  return response.data
}
