"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { GitHubActivityResponse } from "@/types/github"

interface GitHubActivityCardProps {
  activity: GitHubActivityResponse
}

export default function GitHubActivityCard({
  activity,
}: GitHubActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Developer Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Updated Last 30 Days
            </p>

            <p className="text-2xl font-bold">
              {activity.repositoriesUpdatedLast30Days}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Created Last 30 Days
            </p>

            <p className="text-2xl font-bold">
              {activity.repositoriesCreatedLast30Days}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Active Repositories
            </p>

            <p className="text-2xl font-bold">
              {activity.activeRepositories}
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Most Recently Updated
          </p>

          <p className="font-semibold">
            {activity.mostRecentlyUpdatedRepository ??
              "No repositories"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}