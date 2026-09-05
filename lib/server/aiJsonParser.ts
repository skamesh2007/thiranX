export function parseAiJsonObject<T>(responseText: string): T {
  if (!responseText || !responseText.trim()) {
    throw new Error("AI response was empty");
  }

  const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in AI response");
  }

  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
