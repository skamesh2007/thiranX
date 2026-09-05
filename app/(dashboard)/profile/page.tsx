"use client"

import { useRouter } from "next/navigation"
import { Settings, User } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function ProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {user?.username || "User"}
            </h1>

            {user?.email && (
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => router.push("/settings")}
            className="rounded-full p-2 transition hover:bg-muted"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="my-6 border-t" />
        <p>
          {user?.bio || ""}
        </p>
      </div>
    </div>
  )
}