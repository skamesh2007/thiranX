"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CareerMomentumResponse } from "@/types/dashboard"
import {
  Activity,
  AlertTriangle,
  Flag,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

interface CareerMomentumCardProps {
  momentum: CareerMomentumResponse
}

const getMomentumStatus = (score: number) => {
  if (score < 40) {
    return {
      label: "Poor",
      badgeClass:
        "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-950",
      progressClass: "[&>div]:bg-red-500",
      message: "Your consistency is low. Focus on completing tasks regularly.",
    }
  }

  if (score < 70) {
    return {
      label: "Moderate",
      badgeClass:
        "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400 dark:hover:bg-yellow-950",
      progressClass: "[&>div]:bg-yellow-500",
      message:
        "You're making progress, but there is room for more consistency.",
    }
  }

  return {
    label: "Excellent",
    badgeClass:
      "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-950",
    progressClass: "[&>div]:bg-green-500",
    message: "Strong momentum. Maintain your current pace.",
  }
}

export default function CareerMomentumCard({
  momentum,
}: CareerMomentumCardProps) {
  const status = getMomentumStatus(momentum.momentumScore)
  const hasOverdue = momentum.totalOverdueTasks > 0

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          Career Momentum
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Momentum Score
            </span>

            <div className="flex items-center gap-2">
              <Badge className={status.badgeClass}>{status.label}</Badge>
              <span className="font-bold">{momentum.momentumScore}/100</span>
            </div>
          </div>

          <Progress
            value={momentum.momentumScore}
            className={`h-2 ${status.progressClass}`}
          />
          <p className="mt-2 text-sm text-muted-foreground">{status.message}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex gap-3 rounded-xl border p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Strongest Roadmap</p>
              <p className="truncate font-semibold">
                {momentum.strongestRoadmap}
              </p>
              <p className="text-sm text-muted-foreground">
                {momentum.strongestRoadmapProgress}% complete
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <TrendingDown className="h-4 w-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Weakest Roadmap</p>
              <p className="truncate font-semibold">
                {momentum.weakestRoadmap}
              </p>
              <p className="text-sm text-muted-foreground">
                {momentum.weakestRoadmapProgress}% complete
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border p-4">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                hasOverdue ? "bg-red-500/10" : "bg-muted"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${
                  hasOverdue ? "text-red-500" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Overdue Tasks</p>
              <p
                className={`text-2xl font-bold ${
                  hasOverdue ? "text-red-500" : ""
                }`}
              >
                {momentum.totalOverdueTasks}
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
              <Flag className="h-4 w-4 text-violet-500" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                Nearest to Completion
              </p>
              <p className="truncate font-semibold">
                {momentum.nearestCompletionRoadmap}
              </p>
              <p className="text-sm text-muted-foreground">
                {momentum.nearestCompletionPercentage}% complete
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}