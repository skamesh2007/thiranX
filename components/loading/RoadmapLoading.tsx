import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function RoadmapLoading() {
  return (
    <div className="grid h-full gap-6 p-6 lg:grid-cols-3">
      {/* LEFT PANEL */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
              <Skeleton className="mt-3 h-2 w-full rounded-full" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* RIGHT PANEL */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>

        {/* Analytics skeleton */}
        <CardContent className="grid grid-cols-2 gap-4 pb-0 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </CardContent>

        {/* Task list skeleton */}
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <Skeleton className="mt-0.5 h-4 w-4 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}