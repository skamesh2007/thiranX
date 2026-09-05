"use client"

import { useEffect, useState } from "react"

import { getInsights, getSavedInsights } from "@/services/aiService"
import { AIInsightsResponse } from "@/types/ai"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import InsightsLoading from "@/components/loading/InsightsLoading"

import axios from "axios"

type Section = {
  title: string
  description: string
  items: string[] | undefined
  icon: typeof CheckCircle2
  color: "emerald" | "amber" | "blue"
  emptyText: string
}

const colorClasses = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
} as const

export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [refreshError, setRefreshError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const saved = await getSavedInsights()
        setInsights(saved)
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          // No insights saved yet — generate them for the first time.
          try {
            const generated = await getInsights()
            setInsights(generated)
          } catch {
            setError("Failed to generate AI insights")
          }
        } else {
          setError("Failed to load AI insights")
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleRefreshInsights = async () => {
    setRefreshing(true)
    setRefreshError("")

    try {
      const generated = await getInsights()
      setInsights(generated)
    } catch {
      setRefreshError("Failed to refresh AI insights. Please try again later.")
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return <InsightsLoading />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">
              Couldn&apos;t load insights
            </p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
              {error}. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 p-4 py-16 text-center sm:p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">No insights yet</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Generate an analysis from your dashboard to see your strengths,
          weaknesses, and recommended next steps here.
        </p>
      </div>
    )
  }

  const sections: Section[] = [
    {
      title: "Strengths",
      description: "What you're doing well.",
      items: insights.strengths,
      icon: CheckCircle2,
      color: "emerald",
      emptyText: "No strengths identified yet.",
    },
    {
      title: "Weaknesses",
      description: "Areas that need attention.",
      items: insights.weaknesses,
      icon: AlertTriangle,
      color: "amber",
      emptyText: "No weaknesses identified yet.",
    },
    {
      title: "Next Actions",
      description: "Recommended steps to keep moving forward.",
      items: insights.nextActions,
      icon: ArrowRight,
      color: "blue",
      emptyText: "No recommendations available yet.",
    },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
            <Sparkles className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              AI Insights
            </h1>
            <p className="text-sm text-muted-foreground">
              A breakdown of your progress, generated from your activity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshInsights}
          disabled={refreshing}
          aria-label="Refresh AI insights"
          title="Refresh AI insights"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {refreshError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {refreshError}
          </p>
        </div>
      )}

      {sections.map((section) => {
        const Icon = section.icon
        const colors = colorClasses[section.color]

        return (
          <Card key={section.title} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-base">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
                >
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {section.items && section.items.length > 0 ? (
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${colors.bg.replace("/10", "")}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {section.emptyText}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
