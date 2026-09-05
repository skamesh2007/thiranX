"use client"

import { useEffect, useState, useCallback } from "react"

import {
  getRoadmaps,
  deleteRoadmap,
  getRoadmapAnalytics,
} from "@/services/roadmapService"
import { getTasks, updateTask } from "@/services/taskService"

import { Roadmap, RoadmapTask, RoadmapAnalyticsResponse } from "@/types/roadmap"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import CreateRoadmapDialog from "@/components/roadmap/CreateRoadmapDialog"
import CreateTaskDialog from "@/components/roadmap/CreateTaskDialog"

import { Trash2, Loader2 } from "lucide-react"
import { deleteTask } from "@/services/taskService"
import DeleteConfirmDialog from "@/components/roadmap/DeleteConfirmDialog"

import { Checkbox } from "@/components/ui/checkbox"

import EditRoadmapDialog from "@/components/roadmap/EditRoadmapDialog"
import EditTaskDialog from "@/components/roadmap/EditTaskDialog"

import Link from "next/link"
import { Button } from "@/components/ui/button"

import RoadmapAnalyticsCard from "@/components/roadmap/RoadmapAnalyticsCard"
import RoadmapLoading from "@/components/loading/RoadmapLoading"

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
  const [tasks, setTasks] = useState<RoadmapTask[]>([])
  const [analytics, setAnalytics] = useState<RoadmapAnalyticsResponse | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [deletingTaskIds, setDeletingTaskIds] = useState<Set<number>>(new Set())
  const [deletingRoadmapIds, setDeletingRoadmapIds] = useState<Set<number>>(new Set())

  const loadTasks = useCallback(async (roadmapId: number) => {
    try {
      const data = await getTasks(roadmapId)
      setTasks(data)
    } catch (error) {
      console.error("Failed to load tasks", error)
    }
  }, [])

  const loadAnalytics = useCallback(async (roadmapId: number) => {
    try {
      const data = await getRoadmapAnalytics(roadmapId)
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to load analytics", error)
    }
  }, [])

  const loadRoadmaps = useCallback(async () => {
    try {
      setLoading(true)

      const data = await getRoadmaps()
      setRoadmaps(data)

      if (data.length > 0) {
        const firstRoadmap = data[0]
        setSelectedRoadmap(firstRoadmap)

        await Promise.all([
          loadTasks(firstRoadmap.id),
          loadAnalytics(firstRoadmap.id),
        ])
      }
    } catch (error) {
      console.error("Failed to load roadmaps:", error)
    } finally {
      setLoading(false)
    }
  }, [loadTasks, loadAnalytics])

  useEffect(() => {
    void loadRoadmaps()
  }, [loadRoadmaps])

  const selectRoadmap = async (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap)

    await Promise.all([loadTasks(roadmap.id), loadAnalytics(roadmap.id)])
  }

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      await updateTask(taskId, { completed })

      if (!selectedRoadmap) return

      const [, , updatedRoadmaps] = await Promise.all([
        loadTasks(selectedRoadmap.id),
        loadAnalytics(selectedRoadmap.id),
        getRoadmaps(),
      ])

      setRoadmaps(updatedRoadmaps)

      const updatedRoadmap = updatedRoadmaps.find(
        (r) => r.id === selectedRoadmap.id
      )
      if (updatedRoadmap) setSelectedRoadmap(updatedRoadmap)
    } catch (error) {
      console.error("Failed to update task", error)
    }
  }

  const handleDeleteRoadmap = async (roadmapId: number) => {
  try {
    setDeletingRoadmapIds((prev) => new Set(prev).add(roadmapId))
    await deleteRoadmap(roadmapId)

    const updatedRoadmaps = await getRoadmaps()
    setRoadmaps(updatedRoadmaps)

    if (updatedRoadmaps.length > 0) {
      setSelectedRoadmap(updatedRoadmaps[0])
      await loadTasks(updatedRoadmaps[0].id)
    } else {
      setSelectedRoadmap(null)
      setTasks([])
    }
  } catch (error) {
    console.error("Failed to delete roadmap", error)
  } finally {
    setDeletingRoadmapIds((prev) => {
      const next = new Set(prev)
      next.delete(roadmapId)
      return next
    })
  }
}

  const handleDeleteTask = async (taskId: number) => {
  try {
    setDeletingTaskIds((prev) => new Set(prev).add(taskId))
    await deleteTask(taskId)

    if (!selectedRoadmap) return

    const [, , updatedRoadmaps] = await Promise.all([
      loadTasks(selectedRoadmap.id),
      loadAnalytics(selectedRoadmap.id),
      getRoadmaps(),
    ])

    setRoadmaps(updatedRoadmaps)

    const updatedRoadmap = updatedRoadmaps.find((r) => r.id === selectedRoadmap.id)
    if (updatedRoadmap) setSelectedRoadmap(updatedRoadmap)
  } catch (error) {
    console.error("Failed to delete task", error)
  } finally {
    setDeletingTaskIds((prev) => {
      const next = new Set(prev)
      next.delete(taskId)
      return next
    })
  }
}

  if (loading) {
    return <RoadmapLoading />
  }

  return (
    <div className="grid h-full gap-6 p-6 lg:grid-cols-3">
      {/* LEFT PANEL */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Roadmaps</CardTitle>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/roadmap/generate">Generate with AI</Link>
              </Button>

              <CreateRoadmapDialog onCreated={loadRoadmaps} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {roadmaps.length === 0 && (
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">
                No roadmaps found.
              </p>
            </div>
          )}

          {roadmaps.map((roadmap) => (
            <button
              key={roadmap.id}
              onClick={() => selectRoadmap(roadmap)}
              className={`w-full rounded-xl border p-4 text-left transition hover:bg-muted ${selectedRoadmap?.id === roadmap.id ? "border-primary" : ""
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{roadmap.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <EditRoadmapDialog
                    roadmapId={roadmap.id}
                    initialTitle={roadmap.title}
                    initialDescription={roadmap.description ?? ""}
                    onUpdated={loadRoadmaps}
                  />

                  <span className="text-sm text-muted-foreground">
                    {roadmap.progress}%
                  </span>

                  {deletingRoadmapIds.has(roadmap.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <DeleteConfirmDialog
                      title="Delete Roadmap"
                      description="This roadmap and all its tasks will be permanently deleted."
                      onConfirm={() => handleDeleteRoadmap(roadmap.id)}
                      trigger={
                        <Trash2
                          className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    />
                  )}
                </div>
              </div>

              <div className="mt-3">
                <Progress value={roadmap.progress} />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {roadmap.completedTasks}
                {" / "}
                {roadmap.totalTasks}
                {" tasks completed"}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* RIGHT PANEL */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{selectedRoadmap?.title ?? "Tasks"}</CardTitle>

            {selectedRoadmap && (
              <CreateTaskDialog
                roadmapId={selectedRoadmap.id}
                onCreated={async () => {
                  await Promise.all([
                    loadTasks(selectedRoadmap.id),
                    loadAnalytics(selectedRoadmap.id),
                  ])

                  const updatedRoadmaps = await getRoadmaps()

                  setRoadmaps(updatedRoadmaps)

                  const updated = updatedRoadmaps.find(
                    (r) => r.id === selectedRoadmap.id
                  )

                  if (updated) {
                    setSelectedRoadmap(updated)
                  }
                }}
              />
            )}
          </div>
        </CardHeader>
        {analytics && <RoadmapAnalyticsCard analytics={analytics} />}
        <CardContent className="space-y-3">
          {!selectedRoadmap && (
            <p className="text-sm text-muted-foreground">Select a roadmap.</p>
          )}

          {selectedRoadmap && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks available.</p>
          )}

          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      toggleTask(task.id, Boolean(checked))
                    }
                  />

                  <div>
                    <p className="font-medium">{task.title}</p>

                    {task.description && (
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <EditTaskDialog
                    taskId={task.id}
                    title={task.title}
                    description={task.description ?? ""}
                    completed={task.completed}
                    onUpdated={async () => {
                      if (selectedRoadmap) {
                        await loadTasks(selectedRoadmap.id)
                      }
                    }}
                  />

                  {deletingTaskIds.has(task.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <DeleteConfirmDialog
                      title="Delete Task"
                      description="This task will be permanently deleted."
                      onConfirm={() => handleDeleteTask(task.id)}
                      trigger={
                        <Trash2 className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive" />
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
