"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Page() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(token ? "/dashboard" : "/auth/login");
  }, [isHydrated, token, router]);

  // Show spinner while deciding where to go
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
    </div>
  );
}