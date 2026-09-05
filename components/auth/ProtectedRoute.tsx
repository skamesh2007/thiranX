"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/auth/login");
    }
  }, [isHydrated, token, router]);

  // Zustand hasn't read localStorage yet — show spinner, not blank
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  // Hydrated but no token — redirect firing, show nothing
  if (!token) return null;

  return <>{children}</>;
}