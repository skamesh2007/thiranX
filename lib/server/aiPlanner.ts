import { generateText } from "./gemini";
import { parseAiJsonObject } from "./aiJsonParser";

export interface PlannableItem {
  kind: "roadmap_task" | "todo";
  id: number;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours: number;
}

export interface PlanAssignment {
  kind: "roadmap_task" | "todo";
  id: number;
  dayOffset: number; // 0 = today
}

const priorityWeight = (p: string) => (p === "HIGH" ? 3 : p === "MEDIUM" ? 2 : 1);

function buildPrompt(items: PlannableItem[], days: number) {
  const list = items
    .map((i) => `- [${i.kind}#${i.id}] "${i.title}" priority=${i.priority} estimatedHours=${i.estimatedHours}`)
    .join("\n");

  return `Return only valid JSON.

You are scheduling a learner's unscheduled tasks across the next ${days} days
(day 0 = today, day ${days - 1} = the last day of the window).

Balance the daily workload — don't dump everything on day 0. Put
higher-priority items on earlier days. Spread estimated hours roughly
evenly across the window when possible, without exceeding ~4-5 hours
on any single day if avoidable.

Tasks to schedule (use the exact kind and id shown in brackets):
${list}

JSON schema:
{ "assignments": [ { "kind": "roadmap_task|todo", "id": number, "dayOffset": number } ] }

Include exactly one assignment per task listed above. dayOffset must be
an integer between 0 and ${days - 1}. Return JSON only, no markdown.`;
}

function isValidAssignment(a: any, validIds: Set<string>, days: number): a is PlanAssignment {
  return (
    a &&
    (a.kind === "roadmap_task" || a.kind === "todo") &&
    typeof a.id === "number" &&
    validIds.has(`${a.kind}:${a.id}`) &&
    Number.isInteger(a.dayOffset) &&
    a.dayOffset >= 0 &&
    a.dayOffset < days
  );
}

// Deterministic fallback: highest priority items go first, spread
// round-robin across the available days so nothing dumps onto day 0.
function fallbackPlan(items: PlannableItem[], days: number): PlanAssignment[] {
  const sorted = [...items].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
  return sorted.map((item, i) => ({
    kind: item.kind,
    id: item.id,
    dayOffset: i % days,
  }));
}

export async function generateAiPlan(items: PlannableItem[], days: number): Promise<PlanAssignment[]> {
  if (items.length === 0) return [];

  try {
    const text = await generateText(buildPrompt(items, days));
    const parsed = parseAiJsonObject<{ assignments: any[] }>(text);

    const validIds = new Set(items.map((i) => `${i.kind}:${i.id}`));
    const assignments = (parsed.assignments || []).filter((a) => isValidAssignment(a, validIds, days));

    // De-dupe (keep first) in case the model repeated an id, then make
    // sure every requested item actually got scheduled — fill any gaps
    // from the fallback plan instead of silently dropping items.
    const seen = new Set<string>();
    const deduped = assignments.filter((a) => {
      const key = `${a.kind}:${a.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (deduped.length < items.length) {
      const missing = items.filter((i) => !seen.has(`${i.kind}:${i.id}`));
      return [...deduped, ...fallbackPlan(missing, days)];
    }

    return deduped;
  } catch {
    return fallbackPlan(items, days);
  }
}