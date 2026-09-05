import { generateText } from "./gemini";
import { parseAiJsonObject } from "./aiJsonParser";

export interface AiInsightsResult {
  strengths: string[];
  weaknesses: string[];
  nextActions: string[];
}

function buildPrompt(
  progress: number,
  completedTasks: number,
  pendingTasks: number,
  totalTasks: number,
  overdueTasks: number,
  highPriorityPendingTasks: number,
  roadmapSummary: string
) {
  return `Return only valid JSON.

Use only the provided metrics.

A strength must be directly supported by the data.
A weakness must be directly supported by the data.
Do not infer motivation, discipline, focus, consistency, confidence, personality traits, or causes.

Each array must contain 1-3 short items.

Progress:
progressPercent=${progress}
completedTasks=${completedTasks}
pendingTasks=${pendingTasks}
totalTasks=${totalTasks}
overdueTasks=${overdueTasks}
highPriorityPendingTasks=${highPriorityPendingTasks}

Roadmaps:
${roadmapSummary}

Output format:
{ "strengths": [], "weaknesses": [], "nextActions": [] }

Return JSON only.`;
}

function isValid(insights: any): insights is AiInsightsResult {
  return (
    insights &&
    Array.isArray(insights.strengths) && insights.strengths.length > 0 &&
    Array.isArray(insights.weaknesses) && insights.weaknesses.length > 0 &&
    Array.isArray(insights.nextActions) && insights.nextActions.length > 0
  );
}

function fallback(
  totalTasks: number,
  completedTasks: number,
  overdueTasks: number,
  highPriorityPendingTasks: number
): AiInsightsResult {
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks === 0 ? 0 : Math.floor((completedTasks * 100) / totalTasks);

  return {
    strengths: [
      completedTasks > 0 ? `${completedTasks} tasks completed so far` : "Roadmap tasks are ready to be started",
      `Overall progress is ${progress}%`,
    ],
    weaknesses: [
      overdueTasks > 0 ? `${overdueTasks} pending tasks are overdue` : `${pendingTasks} tasks are still pending`,
      highPriorityPendingTasks > 0
        ? `${highPriorityPendingTasks} high priority tasks are pending`
        : "No high priority pending tasks were found",
    ],
    nextActions: [
      overdueTasks > 0 ? "Complete the overdue task first" : "Complete the next pending roadmap task",
      pendingTasks > 0 ? "Update task progress after each study session" : "Add more advanced tasks to continue progressing",
      "Refresh insights after updating your progress",
    ],
  };
}

export async function generateInsights(
  roadmapSummary: string,
  totalTasks: number,
  completedTasks: number,
  overdueTasks: number,
  highPriorityPendingTasks: number
): Promise<AiInsightsResult> {
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks === 0 ? 0 : Math.floor((completedTasks * 100) / totalTasks);

  try {
    const text = await generateText(
      buildPrompt(progress, completedTasks, pendingTasks, totalTasks, overdueTasks, highPriorityPendingTasks, roadmapSummary)
    );
    const parsed = parseAiJsonObject<AiInsightsResult>(text);
    if (!isValid(parsed)) return fallback(totalTasks, completedTasks, overdueTasks, highPriorityPendingTasks);
    return parsed;
  } catch {
    return fallback(totalTasks, completedTasks, overdueTasks, highPriorityPendingTasks);
  }
}
