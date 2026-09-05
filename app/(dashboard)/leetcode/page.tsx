"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getMyLeetCodeStats, getLeetCodeUsername } from "@/services/leetcodeService"
import { LeetCodeStatsResponse } from "@/types/leetcode"

import LeetCodeLoading from "@/components/loading/LeetCodeLoading"
import LeetCoderHeader from "@/components/leetcode/LeetCoderHeader"
import SolvedCounts from "@/components/leetcode/SolvedCounts"
import RecentSubmissions from "@/components/leetcode/RecentSubmissions"
import ManageLink from "@/components/leetcode/ManageLink"
import IfNotLinked from "@/components/leetcode/IfNotLinked"




export default function LeetCodePage() {


  const [stats, setStats] = useState<LeetCodeStatsResponse | null>(null)
  const [hasLinked, setHasLinked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const usernameRes = await getLeetCodeUsername()

        if (!usernameRes.username) {
          setHasLinked(false)
          return
        }

        setHasLinked(true)
        const statsRes = await getMyLeetCodeStats()
        setStats(statsRes)
      } catch {
        setHasLinked(false)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  

  if (loading) {
    return <LeetCodeLoading />
  }

  if (!hasLinked) {
    return <IfNotLinked />
  }


  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-24 sm:p-6 sm:pb-28">

      <LeetCoderHeader {...stats!} />

      <SolvedCounts stats={stats!} />

      <RecentSubmissions stats={stats!} />

      <ManageLink />

    </div>
  )
}