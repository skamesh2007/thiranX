"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Code2, Star, Users, Link2 } from "lucide-react"
import { FaGithub as Github } from "react-icons/fa"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getGitHubUsername, getGitHubStats } from "@/services/githubService"
import { getLeetCodeUsername, getMyLeetCodeStats } from "@/services/leetcodeService"
import { GitHubStatsResponse } from "@/types/github"
import { LeetCodeStatsResponse } from "@/types/leetcode"


export default function PlatformSnapshotCard() {
  const router = useRouter()
 
  const [githubLinked, setGithubLinked] = useState<boolean | null>(null)
  const [githubStats, setGithubStats] = useState<GitHubStatsResponse | null>(null)
 
  const [leetcodeLinked, setLeetcodeLinked] = useState<boolean | null>(null)
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStatsResponse | null>(null)
 
  useEffect(() => {
    getGitHubUsername()
      .then(({ githubUsername }) => {
        setGithubLinked(Boolean(githubUsername))
        if (githubUsername) return getGitHubStats().then(setGithubStats)
      })
      .catch(() => setGithubLinked(false))
 
    getLeetCodeUsername()
      .then(({ username }) => {
        setLeetcodeLinked(Boolean(username))
        if (username) return getMyLeetCodeStats().then(setLeetcodeStats)
      })
      .catch(() => setLeetcodeLinked(false))
  }, [])
 
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card className="cursor-pointer rounded-2xl transition hover:shadow-md" onClick={() => router.push("/github")}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/10">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">GitHub</CardTitle>
              <CardDescription>Your open-source footprint.</CardDescription>
            </div>
          </div>
        </CardHeader>
 
        <CardContent>
          {githubLinked === null ? (
            <div className="h-16 animate-pulse rounded-xl border bg-muted" />
          ) : githubLinked && githubStats ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold">{githubStats.publicRepos}</p>
                <p className="text-xs text-muted-foreground">Repos</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-xl font-bold">
                  <Star className="h-4 w-4 text-amber-500" />
                  {githubStats.totalStars}
                </p>
                <p className="text-xs text-muted-foreground">Stars</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-xl font-bold">
                  <Users className="h-4 w-4 text-blue-500" />
                  {githubStats.followers}
                </p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-6 text-center">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Link your GitHub to see stats here.
              </p>
              <Button size="sm" variant="outline" onClick={() => router.push("/github")}>
                Link GitHub
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
 
      <Card className="cursor-pointer rounded-2xl transition hover:shadow-md" onClick={() => router.push("/leetcode")}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
              <Code2 className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-base">LeetCode</CardTitle>
              <CardDescription>Your problem-solving streak.</CardDescription>
            </div>
          </div>
        </CardHeader>
 
        <CardContent>
          {leetcodeLinked === null ? (
            <div className="h-16 animate-pulse rounded-xl border bg-muted" />
          ) : leetcodeLinked && leetcodeStats ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-emerald-500">{leetcodeStats.easySolved}</p>
                <p className="text-xs text-muted-foreground">Easy</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-500">{leetcodeStats.mediumSolved}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-500">{leetcodeStats.hardSolved}</p>
                <p className="text-xs text-muted-foreground">Hard</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-6 text-center">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Link your LeetCode to see stats here.
              </p>
              <Button size="sm" variant="outline" onClick={() => router.push("/leetcode")}>
                Link LeetCode
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
 