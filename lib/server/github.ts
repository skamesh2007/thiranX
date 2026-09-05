const GITHUB_API = "https://api.github.com";

// Short-lived in-memory cache — the dashboard's GitHub stats/repos/
// languages/activity pages each independently call these, so without
// this a single page load could fire 6-8 GitHub API requests for data
// that hasn't changed in the last minute. Also helps avoid tripping
// GitHub's unauthenticated rate limit.
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit || hit.expiresAt < Date.now()) return undefined;
  return hit.data as T;
}

function setCached(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function headers() {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function fetchGithubProfile(username: string) {
  const key = `profile:${username}`;
  const cached = getCached(key);
  if (cached !== undefined) return cached;

  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, { headers: headers() });
  if (!res.ok) return null;

  const data = await res.json();
  setCached(key, data);
  return data;
}

export async function fetchGithubRepos(username: string) {
  const key = `repos:${username}`;
  const cached = getCached(key);
  if (cached !== undefined) return cached;

  const res = await fetch(
    `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    { headers: headers() }
  );
  if (!res.ok) return [];

  const data = await res.json();
  setCached(key, data);
  return data;
}