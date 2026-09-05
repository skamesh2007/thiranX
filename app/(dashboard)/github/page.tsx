"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaGithub } from "react-icons/fa"
import { ExternalLink, Settings2 } from "lucide-react"
import {
  getGitHubUsername,
  getGitHubStats,
  getGitHubRepositories,
} from "@/services/githubService"
import { GitHubStatsResponse } from "@/types/github"

import GitHubLoading from "@/components/loading/GitHubLoading"

import Image from "next/image"

import RepositoryList from "@/components/github/RepositoryList"

import { GitHubRepositoriesResponse } from "@/types/github"

import GitHubActivityCard from "@/components/github/GitHubActivityCard"

import { GitHubActivityResponse } from "@/types/github"

import { getGitHubActivity } from "@/services/githubService"

// ─── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
      <span className="mb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase sm:text-xs">
        {label}
      </span>
      <span className="text-2xl font-bold sm:text-3xl">{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GitHubPage() {
  const router = useRouter()

  const [stats, setStats] = useState<GitHubStatsResponse | null>(null)
  const [hasLinked, setHasLinked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [repositories, setRepositories] =
    useState<GitHubRepositoriesResponse | null>(null)
  const [activity, setActivity] = useState<GitHubActivityResponse | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const usernameRes = await getGitHubUsername()

        if (!usernameRes.githubUsername) {
          setHasLinked(false)
          return
        }

        setHasLinked(true)

        const [statsRes, repositoriesRes, activityRes] = await Promise.all([
          getGitHubStats(),
          getGitHubRepositories(),
          getGitHubActivity(),
        ])

        setStats(statsRes)
        setRepositories(repositoriesRes)
        setActivity(activityRes)

        setStats(statsRes)
        setRepositories(repositoriesRes)
      } catch {
        setHasLinked(false)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return <GitHubLoading />
  }

  // ── Not connected ──────────────────────────────────────────────────────────

  if (!hasLinked) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-4 text-center sm:p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-20 sm:w-20">
          <FaGithub className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl">
            GitHub not connected
          </h1>
          <p className="text-sm text-muted-foreground">
            Link your GitHub account to track your repositories and activity
            here.
          </p>
        </div>

        <button
          onClick={() => router.push("/profile/edit")}
          className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          <Settings2 className="h-4 w-4" />
          Connect in Edit Profile
        </button>
      </div>
    )
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={stats?.avatarUrl ?? ""}
            alt={stats?.username ?? "GitHub Avatar"}
            width={48}
            height={48}
            className="shrink-0 rounded-full border"
          />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold sm:text-2xl">
              {stats?.username}
            </h1>
            <p className="text-sm text-muted-foreground">
              {stats?.publicRepos} public repos
            </p>
          </div>
        </div>

        {/* Link to GitHub profile */}
        <Link
          href={stats?.profileUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 self-start rounded-xl border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted sm:self-auto"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View on GitHub
        </Link>
      </div>

      {/* Stats grid */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Activity
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Repos" value={stats?.publicRepos ?? 0} />
          <StatCard label="Followers" value={stats?.followers ?? 0} />
          <StatCard label="Following" value={stats?.following ?? 0} />
          <StatCard label="Stars" value={stats?.totalStars ?? 0} />
        </div>
      </div>

      {repositories && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Repos"
              value={repositories.totalRepositories}
            />

            <StatCard label="Total Stars" value={repositories.totalStars} />
          </div>

          <RepositoryList repositories={repositories.repositories} />
        </>
      )}

      {activity && <GitHubActivityCard activity={activity} />}

      {/* Manage link */}
      <div className="flex justify-center">
        <button
          onClick={() => router.push("/profile/edit")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Change linked account in Edit Profile
        </button>
      </div>
    </div>
  )
}
