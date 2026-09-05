import { LeetCodeStatsResponse } from "@/types/leetcode"
import { SiLeetcode } from "react-icons/si"
import { Button } from "@/components/ui/button"
import { refreshLeetCodeStats } from "@/services/leetcodeService"

export default function LeetCoderHeader(stats: LeetCodeStatsResponse) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFA116]/10">
          <SiLeetcode className="h-6 w-6 text-[#FFA116]" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">
            {stats?.username}
          </h1>
          <p className="text-sm text-muted-foreground">
            Global Rank&nbsp;
            <span className="font-semibold text-foreground">
              #{stats?.ranking}
            </span>
          </p>
          <Button onClick={() => refreshLeetCodeStats()}>Refresh Stats</Button>
        </div>
      </div>
    </div>
  )
}
