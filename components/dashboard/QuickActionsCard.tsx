"use client"

import { useRouter } from "next/navigation"
import {
  Code2,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { FaGithub as Github } from "react-icons/fa"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const actions = [
  {
    label: "Generate AI Roadmap",
    description: "Turn a goal into a task plan",
    icon: Sparkles,
    href: "/roadmap/generate",
    accent: "bg-violet-500/10 text-violet-500",
  },
  {
    label: "Add a Roadmap",
    description: "Start tracking something new",
    icon: Plus,
    href: "/roadmap",
    accent: "bg-blue-500/10 text-blue-500",
  },
  {
    label: "Ask AI Coach",
    description: "Get guidance on what's next",
    icon: MessageSquare,
    href: "/chat",
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    label: "View Insights",
    description: "See your strengths & gaps",
    icon: TrendingUp,
    href: "/insights",
    accent: "bg-amber-500/10 text-amber-500",
  },
  {
    label: "GitHub Activity",
    description: "Check repos & stats",
    icon: Github,
    href: "/github",
    accent: "bg-slate-500/10 text-slate-500",
  },
  {
    label: "LeetCode Progress",
    description: "Track problems solved",
    icon: Code2,
    href: "/leetcode",
    accent: "bg-orange-500/10 text-orange-500",
  },
]

export default function QuickActionsCard() {
  const router = useRouter()

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump straight into what matters.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition hover:bg-muted/50"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}