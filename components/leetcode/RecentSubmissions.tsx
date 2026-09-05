import Link from "next/link"
import { getMyLeetCodeStats } from "@/services/leetcodeService"
import { LeetCodeStatsResponse } from "@/types/leetcode"

export default function RecentSubmissions({stats}: {stats: LeetCodeStatsResponse}) {

  console.log("RecentSubmissions stats:", stats)

  return (
    <div>
      {stats?.recentSubmissions && stats.recentSubmissions.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Recent Submissions
          </p>

          <div className="overflow-hidden rounded-2xl border">
            {stats.recentSubmissions.map((sub, i) => {
              const accepted = sub.statusDisplay === "Accepted"
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border-b px-3 py-3 transition last:border-b-0 hover:bg-muted/40 sm:gap-4 sm:px-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`https://leetcode.com/problems/${sub.titleSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate font-medium hover:underline"
                    >
                      {sub.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{sub.lang}</p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      accepted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                    }`}
                  >
                    {sub.statusDisplay}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
