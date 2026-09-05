"use client"

import { cn } from "@/lib/utils"
import { CalendarDay } from "@/types/calendar"

interface Props {
  year: number
  month: number // 0-indexed
  daysByDate: Map<string, CalendarDay>
  selectedDate: string
  onSelectDate: (date: string) => void
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export default function MonthCalendar({
  year,
  month,
  daysByDate,
  selectedDate,
  onSelectDate,
}: Props) {
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = new Date().toISOString().slice(0, 10)

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />

          const dateKey = toDateKey(year, month, day)
          const dayData = daysByDate.get(dateKey)
          const itemCount = dayData?.items.length ?? 0
          const hasOverdueOrHigh = dayData?.items.some(
            (item) => !item.completed && item.priority === "HIGH"
          )
          const isSelected = dateKey === selectedDate
          const isToday = dateKey === todayKey

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateKey)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm transition",
                isSelected
                  ? "bg-emerald-500 text-white"
                  : isToday
                    ? "bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                    : "hover:bg-muted"
              )}
            >
              <span>{day}</span>
              {itemCount > 0 && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isSelected
                      ? "bg-white"
                      : hasOverdueOrHigh
                        ? "bg-red-500"
                        : "bg-emerald-500"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}