"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Palette,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import { logout } from "@/services/authService"
import { ThemeSwitch } from "@/components/theme/theme-switch"

export default function SettingsPage() {
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.replace("/auth/login")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border">
        <div className="border-b bg-muted/30 px-5 py-3">
          <h2 className="font-semibold">Account</h2>
        </div>

        <Link
          href="/profile/edit"
          className="flex items-center justify-between px-5 py-4 transition hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <div>
              <p className="font-medium">Edit Profile</p>
              <p className="text-sm text-muted-foreground">
                Update your personal information
              </p>
            </div>
          </div>

          <ChevronRight className="h-4 w-4" />
        </Link>

        <div className="border-t" />

        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5" />

            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle dark mode</p>
            </div>
          </div>

          <ThemeSwitch />
        </div>

        <div className="border-t" />

        <div className="flex items-center justify-between px-5 py-4 opacity-60">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-muted-foreground">
                Manage notification preferences
              </p>
            </div>
          </div>

          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            Coming soon
          </span>
        </div>

        <div className="border-t" />

        <Link
          href="/settings/privacy"
          className="flex items-center justify-between px-5 py-4 transition hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <div>
              <p className="font-medium">Privacy &amp; Security</p>
              <p className="text-sm text-muted-foreground">
                Change your password and manage account security
              </p>
            </div>
          </div>

          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-950/10">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center justify-between px-5 py-4 transition hover:bg-red-100/70 dark:hover:bg-red-950/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>

            <div className="text-left">
              <p className="font-semibold text-red-600">Sign Out</p>

              <p className="text-sm text-muted-foreground">
                End your current session and return to login
              </p>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-red-500 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}