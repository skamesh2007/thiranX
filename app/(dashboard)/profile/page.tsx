"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  Code2,
  MessageCircle,
  Pencil,
  Settings,
  Sparkles,
  User,
} from "lucide-react"
import { FaLinkedinIn as Linkedin } from "react-icons/fa";

import { FaGithub as Github } from "react-icons/fa"
import { useAuthStore } from "@/store/authStore"

const links = [
  {
    href: "/github",
    label: "GitHub",
    description: "Repos, stars, and activity",
    icon: Github,
    accent: "bg-slate-500/10 text-slate-500",
  },
  {
    href: "/leetcode",
    label: "LeetCode",
    description: "Problems solved by difficulty",
    icon: Code2,
    accent: "bg-orange-500/10 text-orange-500",
  },
  {
    href: "/insights",
    label: "AI Insights",
    description: "Strengths, gaps, and next steps",
    icon: Sparkles,
    accent: "bg-violet-500/10 text-violet-500",
  },
  {
    href: "/chat",
    label: "AI Chat",
    description: "Ask your career coach anything",
    icon: MessageCircle,
    accent: "bg-emerald-500/10 text-emerald-500",
  },
] as const

export default function ProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">
              {user?.username || "User"}
            </h1>

            {user?.email && (
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>

          <button
            onClick={() => router.push("/settings")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-muted"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {user?.bio ? (
          <p className="mt-4 text-sm text-muted-foreground">{user.bio}</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground italic">
            No bio yet — add one from Edit Profile.
          </p>
        )}

        {user?.linkedinUrl && (
          <a
            href={user.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/70"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}

        <button
          onClick={() => router.push("/profile/edit")}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit profile
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border">
        <div className="border-b bg-muted/30 px-5 py-3">
          <h2 className="font-semibold">Explore</h2>
        </div>

        {links.map((link, i) => {
          const Icon = link.icon
          return (
            <div key={link.href}>
              {i > 0 && <div className="border-t" />}
              <Link
                href={link.href}
                className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${link.accent}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{link.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}