"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { RoadmapAnalyticsResponse } from "@/types/roadmap";

interface RoadmapAnalyticsCardProps {
  analytics: RoadmapAnalyticsResponse;
}

export default function RoadmapAnalyticsCard({
  analytics,
}: RoadmapAnalyticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roadmap Insights</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Completion Progress
            </span>

            <span className="font-medium">
              {analytics.completionPercentage}%
            </span>
          </div>

          <Progress value={analytics.completionPercentage} />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Completed
              </p>
              <p className="text-2xl font-bold">
                {analytics.completedTasks}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Remaining
              </p>
              <p className="text-2xl font-bold">
                {analytics.remainingTasks}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Overdue
              </p>

              <p className="text-2xl font-bold">
                {analytics.overdueTasks}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Hours Left
              </p>

              <p className="text-2xl font-bold">
                {analytics.estimatedHoursRemaining}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">
            Forecast
          </h3>

          <p className="text-sm text-muted-foreground">
            {analytics.projectedCompletionDays === -1
              ? "Complete some tasks to generate a forecast."
              : `${analytics.projectedCompletionDays} days remaining`}
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">
            Recommended Next Tasks
          </h3>

          <div className="space-y-3">
            {analytics.nextRecommendedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending tasks.
              </p>
            ) : (
              analytics.nextRecommendedTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {task.title}
                    </p>

                    <Badge>
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                    {task.dueDate && (
                      <span>
                        Due: {task.dueDate}
                      </span>
                    )}

                    {task.estimatedHours && (
                      <span>
                        {task.estimatedHours} hrs
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {analytics.overdueTasks > 0 && (
          <div className="rounded-lg border border-red-500 p-3">
            <p className="font-medium text-red-500">
              {analytics.overdueTasks} overdue task(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}