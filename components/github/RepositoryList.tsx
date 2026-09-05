"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import {
  GitHubRepositoryResponse,
} from "@/types/github"

interface RepositoryListProps {
  repositories: GitHubRepositoryResponse[]
}

export default function RepositoryList({
  repositories,
}: RepositoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Top Repositories
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {repositories.map((repo) => (
          <div
            key={repo.name}
            className="rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <a
                href={repo.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold hover:underline"
              >
                {repo.name}
              </a>

              <div className="flex gap-2">
                <Badge variant="secondary">
                  ⭐ {repo.stars}
                </Badge>

                <Badge variant="outline">
                  🍴 {repo.forks}
                </Badge>
              </div>
            </div>

            {repo.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {repo.description}
              </p>
            )}

            {repo.language && (
              <Badge className="mt-3">
                {repo.language}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}