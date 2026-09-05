import { Skeleton } from "@/components/ui/skeleton"

export default function GitHubLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <Skeleton className="h-8 w-32 self-start rounded-xl sm:self-auto" />
      </div>

      {/* Stats grid */}
      <div>
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

      {/* Manage link */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-44" />
      </div>

    </div>
  )
}