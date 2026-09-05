import { LeetCodeStatsResponse } from "@/types/leetcode";
import DiffBadge from "./DiffBadge";

export default function SolvedCounts({ stats }: { stats: LeetCodeStatsResponse }) {
    return(
        <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Problems Solved
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border bg-card p-3 shadow-sm sm:col-span-1 sm:p-5">
            <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-xs">
              Total
            </span>
            <span className="text-2xl font-bold sm:text-3xl">{stats?.totalSolved}</span>
          </div>
          <DiffBadge label="Easy"   count={stats?.easySolved   ?? 0} color="text-emerald-500" />
          <DiffBadge label="Medium" count={stats?.mediumSolved ?? 0} color="text-amber-500"   />
          <DiffBadge label="Hard"   count={stats?.hardSolved   ?? 0} color="text-red-500"     />
        </div>
      </div>
    )
}