"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CalendarClock, CheckCircle2, ListTodo } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateTask } from "@/services/taskService"
import { UpcomingTask } from "@/types/dashboard"

const priorityBadgeClass: Record<UpcomingTask["priority"], string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

interface UpcomingTasksCardProps {
  tasks: UpcomingTask[]
  loading: boolean
  onTaskCompleted: (taskId: number) => void
}

export default function UpcomingTasksCard({
  tasks,
  loading,
  onTaskCompleted,
}: UpcomingTasksCardProps) {
  const router = useRouter()
  const [completingId, setCompletingId] = useState<number | null>(null)

  const handleComplete = async (taskId: number) => {
    setCompletingId(taskId)
    try {
      await updateTask(taskId, { completed: true })
      onTaskCompleted(taskId)
    } catch (error) {
      console.error("Failed to complete task", error)
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
              <ListTodo className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle>Up Next</CardTitle>
              <CardDescription>
                Your most pressing tasks across every roadmap.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <>
            <div className="h-14 animate-pulse rounded-xl border bg-muted" />
            <div className="h-14 animate-pulse rounded-xl border bg-muted" />
            <div className="h-14 animate-pulse rounded-xl border bg-muted" />
          </>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <p className="text-sm text-muted-foreground">
              Nothing pending — you&apos;re all caught up.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.taskId}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{task.title}</p>
                  <Badge className={priorityBadgeClass[task.priority]}>
                    {task.priority}
                  </Badge>
                  {task.overdue && (
                    <Badge className="bg-red-500 text-white hover:bg-red-500">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {task.roadmapTitle}
                  {task.dueDate && (
                    <>
                      {" "}
                      • <CalendarClock className="mb-0.5 inline h-3 w-3" />{" "}
                      Due {task.dueDate}
                    </>
                  )}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={completingId === task.taskId}
                onClick={() => handleComplete(task.taskId)}
              >
                {completingId === task.taskId ? "…" : "Done"}
              </Button>
            </div>
          ))
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/roadmap")}
        >
          View all roadmaps
        </Button>
      </CardContent>
    </Card>
  )
}