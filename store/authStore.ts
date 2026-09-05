"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  setHydrated: (v: boolean) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false, // starts false every page load — never persisted

      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrated: (v) => set({ isHydrated: v }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist token and user — NOT isHydrated
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Called once localStorage has been read and token/user are restored
        state?.setHydrated(true);
      },
    }
  )
);

export const getToken = () => useAuthStore.getState().token;