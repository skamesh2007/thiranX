// Thin REST wrapper around the Gemini generateContent endpoint.
// Retries only on transient failures (429 / 5xx / network) — a bad
// API key, invalid model name, or malformed request is not going to
// succeed on retry, so those fail fast instead of burning ~9s of
// backoff before falling back.
const FALLBACK_JSON = (reason: string) =>
  JSON.stringify({
    strengths: ["AI insights temporarily unavailable"],
    weaknesses: [reason],
    nextActions: ["Try again later"],
  });

const REQUEST_TIMEOUT_MS = 15_000;

function isRetryable(status: number) {
  return status === 429 || status >= 500;
}

export async function generateText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const maxAttempts = 3;
  let lastWasRateLimited = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        if (res.status === 429) lastWasRateLimited = true;

        // Non-retryable client error (bad key, bad model, bad request) —
        // retrying the identical request will fail identically. Bail now.
        if (!isRetryable(res.status)) {
          console.error(`Gemini returned non-retryable status ${res.status}`);
          return FALLBACK_JSON(
            res.status === 401 || res.status === 403
              ? "AI service authentication failed"
              : "AI service rejected the request"
          );
        }
        throw new Error(`Gemini returned status ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned empty response");
      return text;
    } catch (err) {
      clearTimeout(timeout);
      if (attempt === maxAttempts) {
        console.error("Gemini request failed after retries:", err);
        return FALLBACK_JSON(lastWasRateLimited ? "Gemini API quota exceeded" : "AI service unavailable");
      }
      // Short, capped backoff — transient errors get one quick retry
      // window instead of multi-second exponential waits.
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }

  return FALLBACK_JSON("Unexpected AI service error");
}