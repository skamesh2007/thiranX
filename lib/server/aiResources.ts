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

export interface TaskResourcesResult {
  resources: TaskResource[];
  // "fallback" means Gemini didn't return usable output and these are
  // generic placeholders, not resources tailored to this task. Callers
  // should say so in the UI rather than presenting them as AI picks.
  source: "ai" | "fallback";
}

// Titles that are just "<task> — <generic noun>" carry no information
// beyond the task title itself. If the model falls back to this shape
// despite instructions, treat it as low-quality output rather than a
// genuine per-task recommendation.
const GENERIC_SUFFIXES = [
  "video walkthrough",
  "official documentation",
  "written guide",
  "tutorial",
  "guide",
  "overview",
];

function looksGeneric(title: string, taskTitle: string): boolean {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedTask = taskTitle.trim().toLowerCase();
  if (!normalizedTitle.startsWith(normalizedTask)) return false;
  const remainder = normalizedTitle.slice(normalizedTask.length).replace(/^[\s—:-]+/, "");
  return GENERIC_SUFFIXES.includes(remainder);
}

function isValid(parsed: any, taskTitle: string): parsed is { resources: RawResourceSuggestion[] } {
  if (
    !parsed ||
    !Array.isArray(parsed.resources) ||
    parsed.resources.length === 0 ||
    !parsed.resources.every(
      (r: any) =>
        typeof r?.title === "string" &&
        r.title.trim().length > 0 &&
        typeof r?.searchQuery === "string" &&
        r.searchQuery.trim().length > 0 &&
        ["video", "article", "documentation", "course"].includes(r?.type)
    )
  ) {
    return false;
  }

  // If every single suggestion is a generic "<task> — noun" template,
  // the model ignored the instruction to be specific — reject it so
  // the caller falls back instead of showing filler dressed as AI output.
  const allGeneric = parsed.resources.every((r: RawResourceSuggestion) =>
    looksGeneric(r.title, taskTitle)
  );
  return !allGeneric;
}

function buildPrompt(taskTitle: string, taskDescription: string | null, roadmapTitle: string) {
  return `Return only valid JSON.

A learner is working on this task as part of a learning roadmap:

Roadmap: ${roadmapTitle}
Task: ${taskTitle}
${taskDescription ? `Details: ${taskDescription}` : ""}

Identify the specific technology, tool, concept, or skill this task is
actually about (e.g. if the task is "Learn React hooks", the specific
subject is "React hooks", not "the task"). Then suggest 4-6 learning
resources for THAT specific subject.

Be concrete and specific — name the actual technology/concept/tool in
each resource title. Do NOT use generic filler titles like
"<task name> — video walkthrough", "<task name> — official
documentation", or "<task name> — written guide". Instead, name what
the resource actually teaches, e.g. "React useEffect and useState
explained", "Official React documentation: Hooks reference",
"freeCodeCamp: React Hooks course".

Prefer well-known, reputable, real sources: official documentation
sites, MDN, freeCodeCamp, official YouTube channels for the
technology, well-known course platforms. Vary the resource types
(mix of video/article/documentation/course) where it makes sense for
the subject.

Do NOT invent URLs. Instead give a concise, specific search query for
each resource that would surface it on YouTube or Google — the query
should name the actual technology/concept, not just repeat the task
title verbatim.

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
): Promise<TaskResourcesResult> {
  try {
    const text = await generateText(buildPrompt(taskTitle, taskDescription, roadmapTitle));
    const parsed = parseAiJsonObject<{ resources: RawResourceSuggestion[] }>(text);

    if (!isValid(parsed, taskTitle)) {
      console.error(
        "AI resources: model output was missing, malformed, or entirely generic — using fallback."
      );
      return { resources: fallbackResources(taskTitle), source: "fallback" };
    }

    return { resources: parsed.resources.slice(0, 6).map(toResource), source: "ai" };
  } catch (err) {
    console.error("AI resources: generation failed, using fallback.", err);
    return { resources: fallbackResources(taskTitle), source: "fallback" };
  }
}