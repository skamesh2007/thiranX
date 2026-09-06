"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import MonthCalendar from "@/components/calendar/monthCalendar"
import AddTodoDialog from "@/components/calendar/addToDoDialog"
import InlineToast from "@/components/ui/inline-toast"

import { getCalendarMonth, generateAiPlan } from "@/services/calendarService"
import { updateTodo, deleteTodo } from "@/services/todoService"
import { updateTask } from "@/services/taskService"
import { CalendarDay } from "@/types/calendar"

const priorityBadgeClass: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  const [daysByDate, setDaysByDate] = useState<Map<string, CalendarDay>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayKey())

  const [planning, setPlanning] = useState(false)
  const [planMessage, setPlanMessage] = useState("")

  const [saveError, setSaveError] = useState("")
  const saveErrorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showSaveError = (message: string) => {
    if (saveErrorTimeout.current) clearTimeout(saveErrorTimeout.current)
    setSaveError(message)
    saveErrorTimeout.current = setTimeout(() => setSaveError(""), 4000)
  }

  const loadMonth = useCallback(async () => {
    setLoading(true)
    try {
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`
      const data = await getCalendarMonth(monthKey)
      setDaysByDate(new Map(data.days.map((d) => [d.date, d])))
    } catch (err) {
      console.error("Failed to load calendar", err)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    void loadMonth()
  }, [loadMonth])

  const goToMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  const handleToggleComplete = async (
    kind: "roadmap_task" | "todo",
    id: number,
    completed: boolean
  ) => {
    // Optimistic update — flip the checkbox immediately instead of
    // waiting on the update call + a full month reload.
    const previous = daysByDate
    setDaysByDate((prev) => {
      const next = new Map(prev)
      for (const [date, day] of next) {
        const items = day.items.map((item) =>
          item.kind === kind && item.id === id ? { ...item, completed } : item
        )
        next.set(date, { ...day, items })
      }
      return next
    })

    try {
      if (kind === "todo") {
        await updateTodo(id, { completed })
      } else {
        await updateTask(id, { completed })
      }
    } catch (err) {
      console.error("Failed to update item", err)
      setDaysByDate(previous)
      showSaveError("Couldn't save that change — please try again.")
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id)
      await loadMonth()
    } catch (err) {
      console.error("Failed to delete todo", err)
    }
  }

  const handleAiPlan = async () => {
    setPlanning(true)
    setPlanMessage("")
    try {
      const result = await generateAiPlan(7)
      setPlanMessage(
        result.scheduled === 0
          ? "Nothing to schedule — every task already has a due date."
          : `Scheduled ${result.scheduled} task${result.scheduled === 1 ? "" : "s"} across the next 7 days.`
      )
      await loadMonth()
    } catch (err) {
      console.error("Failed to generate AI plan", err)
      setPlanMessage("Couldn't generate a plan. Try again.")
    } finally {
      setPlanning(false)
    }
  }

  const selectedDay = daysByDate.get(selectedDate)
  const monthLabel = new Date(year, month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <InlineToast message={saveError} onDismiss={() => setSaveError("")} />
      <div className="container mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <CalendarDays className="h-6 w-6 text-emerald-500" />
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Every task and to-do, in one place.
          </p>
        </div>

        <Button onClick={handleAiPlan} disabled={planning}>
          {planning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Planning…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Plan My Week
            </>
          )}
        </Button>
      </div>

      {planMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
          {planMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{monthLabel}</CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => goToMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => goToMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-72 animate-pulse rounded-xl bg-muted" />
            ) : (
              <MonthCalendar
                year={year}
                month={month}
                daysByDate={daysByDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">
                {selectedDate === todayKey() ? "Today" : selectedDate}
              </CardTitle>
              <CardDescription>
                {selectedDay?.items.length ?? 0} item
                {(selectedDay?.items.length ?? 0) === 1 ? "" : "s"}
              </CardDescription>
            </div>
            {selectedDate >= todayKey() && (
              <AddTodoDialog defaultDate={selectedDate} onCreated={loadMonth} />
            )}
          </CardHeader>

          <CardContent className="space-y-2">
            {!selectedDay || selectedDay.items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing due this day.
              </p>
            ) : (
              selectedDay.items.map((item) => (
                <div
                  key={`${item.kind}-${item.id}`}
                  className="flex items-start gap-3 rounded-xl border p-3"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) =>
                      handleToggleComplete(item.kind, item.id, Boolean(checked))
                    }
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`truncate font-medium ${item.completed ? "text-muted-foreground line-through" : ""}`}
                      >
                        {item.title}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadgeClass[item.priority]}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.kind === "roadmap_task" ? item.roadmapTitle : "Personal to-do"}
                    </p>
                  </div>

                  {item.kind === "todo" && (
                    <button
                      onClick={() => handleDeleteTodo(item.id)}
                      className="text-muted-foreground transition hover:text-red-500"
                      aria-label="Delete to-do"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}