import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>

            <CardContent className="space-y-3">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning skeleton */}
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border p-4 space-y-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* AI sections skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full rounded-2xl">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-full" />
              </div>

              <div className="rounded-xl border p-4 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-full" />
              </div>

              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full rounded-2xl">
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>

            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Career Progress skeleton */}
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}