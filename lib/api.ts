import axios from "axios";
import { useAuthStore, getToken } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach JWT Bearer token to every outgoing request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — token expired or invalidated — auto logout and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();

      if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      }

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;