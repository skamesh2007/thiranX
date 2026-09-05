import { generateText } from "./gemini";
import { parseAiJsonObject } from "./aiJsonParser";

export interface AiRoadmapTask {
  title: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours?: number;
  dueInDays?: number;
}
export interface AiRoadmapResult {
  roadmapTitle: string;
  tasks: AiRoadmapTask[];
}

function buildPrompt(goal: string) {
  return `You are an expert software learning roadmap planner.

Return ONLY valid JSON.

Goal: ${goal}

Current date: ${new Date().toISOString().slice(0, 10)}

JSON schema:
{
  "roadmapTitle": "string",
  "tasks": [
    { "title": "string", "priority": "HIGH|MEDIUM|LOW", "estimatedHours": number, "dueInDays": number }
  ]
}

Rules:
- Generate 5 to 10 learning tasks.
- Tasks must be ordered from beginner to advanced.
- priority must be HIGH, MEDIUM, or LOW.
- estimatedHours must be between 2 and 50.
- dueInDays must be realistic; earlier tasks shorter, advanced tasks longer.
- Do not include explanations or markdown. Return valid JSON only.`;
}

function fallbackRoadmap(goal: string): AiRoadmapResult {
  return {
    roadmapTitle: goal,
    tasks: [
      { title: "Define the learning goal clearly", priority: "HIGH", estimatedHours: 2, dueInDays: 1 },
      { title: "Learn the required fundamentals", priority: "HIGH", estimatedHours: 10, dueInDays: 7 },
      { title: "Build a small practice project", priority: "MEDIUM", estimatedHours: 12, dueInDays: 14 },
      { title: "Review common mistakes and best practices", priority: "MEDIUM", estimatedHours: 5, dueInDays: 21 },
      { title: "Create a final portfolio-ready project", priority: "LOW", estimatedHours: 20, dueInDays: 30 },
    ],
  };
}

function isValid(result: any): result is AiRoadmapResult {
  return (
    result &&
    typeof result.roadmapTitle === "string" &&
    result.roadmapTitle.trim().length > 0 &&
    Array.isArray(result.tasks) &&
    result.tasks.length > 0 &&
    result.tasks.every((t: any) => typeof t?.title === "string" && t.title.trim().length > 0)
  );
}

export async function generateAiRoadmap(goal: string): Promise<AiRoadmapResult> {
  try {
    const text = await generateText(buildPrompt(goal));
    const parsed = parseAiJsonObject<AiRoadmapResult>(text);
    if (!isValid(parsed)) return fallbackRoadmap(goal);
    return parsed;
  } catch {
    return fallbackRoadmap(goal);
  }
}