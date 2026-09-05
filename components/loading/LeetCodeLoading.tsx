import { Skeleton } from "@/components/ui/skeleton"

export default function LeetCodeLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-24 sm:p-6 sm:pb-28">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <Skeleton className="h-8 w-32 self-start rounded-xl sm:self-auto" />
      </div>

      {/* Solve counts */}
      <div>
        <Skeleton className="mb-3 h-3 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-3 shadow-sm sm:col-span-1 sm:p-5">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-8 w-10" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-3 shadow-sm sm:p-5"
            >
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-8 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      <div>
        <Skeleton className="mb-3 h-3 w-40" />

        <div className="overflow-hidden rounded-2xl border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 border-b px-3 py-3 last:border-b-0 sm:gap-4 sm:px-4"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-16" />
              </div>

              <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Manage link */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-44" />
      </div>

    </div>
  )
}