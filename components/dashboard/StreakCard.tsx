"use client"

import { Flame, Trophy, CalendarCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StreakResponse } from "@/types/streak"

interface Props {
  streak: StreakResponse | null
  loading: boolean
}

export default function StreakCard({ streak, loading }: Props) {
  if (loading) {
    return <div className="h-28 animate-pulse rounded-2xl border bg-muted" />
  }

  if (!streak) return null

  const hasStreak = streak.currentStreak > 0

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-4 py-2">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            hasStreak
              ? "bg-orange-500/10 text-orange-500"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Flame className="h-6 w-6" fill={hasStreak ? "currentColor" : "none"} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold leading-tight">
            {streak.currentStreak}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              day{streak.currentStreak === 1 ? "" : "s"}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {hasStreak
              ? streak.activeToday
                ? "You've completed something today — keep it going!"
                : "Complete a task today to extend your streak."
              : "Complete a task to start a streak."}
          </p>
        </div>

        <div className="hidden shrink-0 gap-4 sm:flex">
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-sm font-semibold">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              {streak.longestStreak}
            </p>
            <p className="text-[10px] text-muted-foreground">Best</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-sm font-semibold">
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />
              {streak.completedThisWeek}
            </p>
            <p className="text-[10px] text-muted-foreground">This week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}