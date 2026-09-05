"use client"

import { useEffect, useState } from "react"

import { useAuthStore } from "@/store/authStore"
import { getDashboard } from "@/services/dashboardService"

import AICoachCard from "@/components/dashboard/AICoachCard"

import { getSavedInsights } from "@/services/aiService"
import { AIInsightsResponse } from "@/types/ai"

import CareerMomentumCard from "@/components/dashboard/CareerMomentumCard"

import { getCareerMomentum } from "@/services/dashboardService"

import { CareerMomentumResponse, DashboardResponse } from "@/types/dashboard"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { useRouter } from "next/navigation"

import {
  BookOpen,
  CheckCircle2,
  Code2,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react"

import DashboardLoading from "@/components/loading/DashboardLoading"

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const router = useRouter()

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(false)

  const [momentum, setMomentum] = useState<CareerMomentumResponse | null>(null)

  useEffect(() => {
    console.log("Dashboard effect fired")

    Promise.all([getDashboard(), getCareerMomentum()])
      .then(([dashboardData, momentumData]) => {
        setDashboard(dashboardData)
        setMomentum(momentumData)
      })
      .catch(console.error)
      .finally(() => setDashboardLoading(false))

    // Fetched separately: a 404 here just means no insights have been
    // generated yet, and shouldn't block the rest of the dashboard.
    getSavedInsights()
      .then(setInsights)
      .catch(() => setInsights(null))
  }, [])

  console.log(insights)

  const stats = dashboard
    ? [
        {
          title: "Roadmap Progress",
          value: `${dashboard.roadmapProgress}%`,
          description: `${dashboard.completedTasks} of ${dashboard.totalTasks} tasks completed`,
          icon: Target,
          progress: dashboard.roadmapProgress,
          isProgressIndeterminate: false,
        },
        {
          title: "LeetCode Solved",
          value: dashboard.leetcodeSolved.toString(),
          description: "Problems solved",
          icon: Code2,
          progress: 100,
          isProgressIndeterminate: true,
        },
        {
          title: "Completed Tasks",
          value: dashboard.completedTasks.toString(),
          description: `${dashboard.totalTasks} total tasks`,
          icon: CheckCircle2,
          progress:
            dashboard.totalTasks === 0
              ? 0
              : (dashboard.completedTasks * 100) / dashboard.totalTasks,
          isProgressIndeterminate: false,
        },
        {
          title: "Active Projects",
          value: dashboard.activeProjects.toString(),
          description: "Projects in progress",
          icon: Rocket,
          progress: 0,
          isProgressIndeterminate: true,
        },
      ]
    : []

  if (dashboardLoading) {
    return <DashboardLoading />
  }

  if (!dashboard && !dashboardLoading) {
    return <div className="p-6">Failed to load dashboard data.</div>
  }

  return (
    <div className="container mx-auto space-y-6 p-4 sm:space-y-8 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Dashboard
            </Badge>
          </div>
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome, {user?.username ?? "User"}!
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {user?.email ?? "your email"} • Your career progress at a glance
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push("/roadmap")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View Roadmap
          </Button>

          <Button
            className="w-full sm:w-auto"
            onClick={() => router.push("/roadmap/generate")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Roadmap
          </Button>
        </div>
      </div>

      {/* Continue Learning */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>

          <CardDescription>Pick up where you left off.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border p-4">
            <p className="font-medium">Your Current Roadmap</p>

            <p className="text-sm text-muted-foreground">
              {dashboard?.completedTasks ?? 0} of {dashboard?.totalTasks ?? 0}{" "}
              tasks completed
            </p>

            <Progress
              value={dashboard?.roadmapProgress ?? 0}
              className="mt-3"
            />
          </div>

          <Button className="w-full" onClick={() => router.push("/roadmap")}>
            Continue Roadmap
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.title} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>

                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{stat.value}</div>

                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>

                {stat.isProgressIndeterminate ? null : (
                  <Progress value={stat.progress} className="h-2" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {momentum && <CareerMomentumCard momentum={momentum} />}

      <AICoachCard
        insightsLoading={insightsLoading}
        insights={insights}
        router={router}
      />
    </div>
  )
}