import { generateText } from "./gemini";
import { parseAiJsonObject } from "./aiJsonParser";

export type ResourceType = "video" | "article" | "documentation" | "course";

export interface RawResourceSuggestion {
  title: string;
  type: ResourceType;
  platform: string;
  // A search query, not a URL — the AI is prone to hallucinating dead
  // links, so we never trust a model-generated URL. Instead we turn
  // this into a real, always-valid search link ourselves.
  searchQuery: string;
}

export interface TaskResource extends RawResourceSuggestion {
  url: string;
}

function isValid(parsed: any): parsed is { resources: RawResourceSuggestion[] } {
  return (
    parsed &&
    Array.isArray(parsed.resources) &&
    parsed.resources.length > 0 &&
    parsed.resources.every(
      (r: any) =>
        typeof r?.title === "string" &&
        r.title.trim().length > 0 &&
        typeof r?.searchQuery === "string" &&
        r.searchQuery.trim().length > 0 &&
        ["video", "article", "documentation", "course"].includes(r?.type)
    )
  );
}

function buildPrompt(taskTitle: string, taskDescription: string | null, roadmapTitle: string) {
  return `Return only valid JSON.

A learner is working on this task as part of a learning roadmap:

Roadmap: ${roadmapTitle}
Task: ${taskTitle}
${taskDescription ? `Details: ${taskDescription}` : ""}

Suggest 4-6 learning resources that would help complete this specific task.
Prefer well-known, reputable sources (official docs, MDN, freeCodeCamp,
official YouTube channels, well-known courses).

Do NOT invent URLs. Instead give a concise, specific search query for
each resource that would surface it on YouTube or Google.

JSON schema:
{
  "resources": [
    { "title": "string", "type": "video|article|documentation|course", "platform": "string", "searchQuery": "string" }
  ]
}

Return JSON only, no markdown.`;
}

function toResource(raw: RawResourceSuggestion): TaskResource {
  const query = encodeURIComponent(raw.searchQuery);
  const url =
    raw.type === "video"
      ? `https://www.youtube.com/results?search_query=${query}`
      : `https://www.google.com/search?q=${query}`;
  return { ...raw, url };
}

function fallbackResources(taskTitle: string): TaskResource[] {
  const suggestions: RawResourceSuggestion[] = [
    {
      title: `${taskTitle} — video walkthrough`,
      type: "video",
      platform: "YouTube",
      searchQuery: `${taskTitle} tutorial`,
    },
    {
      title: `${taskTitle} — official documentation`,
      type: "documentation",
      platform: "Web search",
      searchQuery: `${taskTitle} official documentation`,
    },
    {
      title: `${taskTitle} — written guide`,
      type: "article",
      platform: "Web search",
      searchQuery: `${taskTitle} guide for beginners`,
    },
  ];
  return suggestions.map(toResource);
}

export async function generateTaskResources(
  taskTitle: string,
  taskDescription: string | null,
  roadmapTitle: string
): Promise<TaskResource[]> {
  try {
    const text = await generateText(buildPrompt(taskTitle, taskDescription, roadmapTitle));
    const parsed = parseAiJsonObject<{ resources: RawResourceSuggestion[] }>(text);
    if (!isValid(parsed)) return fallbackResources(taskTitle);
    return parsed.resources.slice(0, 6).map(toResource);
  } catch {
    return fallbackResources(taskTitle);
  }
}