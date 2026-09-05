"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowRight,
  Lightbulb,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { AIInsightsResponse } from "@/types/ai"
import { useRouter } from "next/navigation"

type AICoachCardProps = {
  insightsLoading: boolean
  insights: AIInsightsResponse | null
  router: ReturnType<typeof useRouter>
}

export default function AICoachCard({
  insightsLoading,
  insights,
  router,
}: AICoachCardProps) {




  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* AI Career Coach */}
      <div className="lg:col-span-2">
        <Card className="h-full rounded-2xl">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle>AI Career Coach</CardTitle>
                  <CardDescription>
                    Personalized guidance based on your progress.
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                className="min-w-[104px] self-start sm:self-auto"
                onClick={() => router.push("/insights")}
                disabled={insightsLoading || !!insights}
                hidden={Boolean(insights)}
              >
                {insightsLoading
                  ? "Generating…"
                  : insights
                    ? "Generated"
                    : "Generate"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {insightsLoading ? (
              <>
                <div className="h-20 animate-pulse rounded-xl border bg-muted" />
                <div className="h-20 animate-pulse rounded-xl border bg-muted" />
              </>
            ) : insights ? (
              <>
                <div className="flex gap-3 rounded-xl border p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">Recommended Next Step</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {insights.nextActions?.[0] ??
                        "No recommendations available yet."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">Improvement Area</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {insights.weaknesses?.[0] ??
                        "No weaknesses identified yet."}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/insights")}
                >
                  View Full Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-center">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No insights yet — generate your first analysis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}