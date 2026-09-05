import { Skeleton } from "@/components/ui/skeleton"

export default function EditProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Form Card */}
      <div className="space-y-6 rounded-3xl border bg-card p-6 shadow-sm">
        {/* Account section */}
        <div>
          <Skeleton className="mb-4 h-3 w-20" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-3 w-56" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Integrations section */}
        <div>
          <Skeleton className="mb-4 h-3 w-28" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-3 w-60" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-3 w-60" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-[110px] w-full rounded-xl" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        {/* Save button */}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}