import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";

function toDateKey(iso: string) {
  return iso.slice(0, 10); // "YYYY-MM-DD"
}

function daysBefore(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// Computes a real streak from completion timestamps already stored on
// roadmap_tasks and todos — no fabricated numbers. A day "counts" if
// at least one task or todo was completed on it.
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const { data: roadmaps } = await supabaseAdmin
      .from("roadmaps")
      .select("id")
      .eq("user_id", user.id);
    const roadmapIds = (roadmaps || []).map((r) => r.id);

    const { data: completedTasks } = roadmapIds.length
      ? await supabaseAdmin
          .from("roadmap_tasks")
          .select("completed_at")
          .in("roadmap_id", roadmapIds)
          .eq("completed", true)
          .not("completed_at", "is", null)
      : { data: [] as any[] };

    const { data: completedTodos } = await supabaseAdmin
      .from("todos")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .not("completed_at", "is", null);

    const completionDates = new Set<string>();
    for (const t of completedTasks || []) completionDates.add(toDateKey(t.completed_at));
    for (const t of completedTodos || []) completionDates.add(toDateKey(t.completed_at));

    if (completionDates.size === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        completedThisWeek: 0,
        activeToday: false,
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = daysBefore(today, 1);

    // Current streak: count consecutive days backward from today. If
    // today has no completion yet, the streak is still "alive" as
    // long as yesterday has one — it just hasn't been extended yet.
    let currentStreak = 0;
    let cursor = completionDates.has(today) ? today : yesterday;
    if (completionDates.has(cursor)) {
      while (completionDates.has(cursor)) {
        currentStreak++;
        cursor = daysBefore(cursor, 1);
      }
    }

    // Longest streak ever, computed from the full set of distinct
    // completion dates.
    const sortedDates = Array.from(completionDates).sort();
    let longestStreak = 0;
    let run = 0;
    let prevDate: string | null = null;
    for (const date of sortedDates) {
      if (prevDate && daysBefore(date, 1) === prevDate) {
        run++;
      } else {
        run = 1;
      }
      longestStreak = Math.max(longestStreak, run);
      prevDate = date;
    }

    const weekStart = daysBefore(today, 6);
    const completedThisWeek = sortedDates.filter((d) => d >= weekStart && d <= today).length;

    return NextResponse.json({
      currentStreak,
      longestStreak,
      completedThisWeek,
      activeToday: completionDates.has(today),
    });
  } catch (err) {
    return errorResponse(err);
  }
}