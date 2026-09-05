import { supabaseAdmin } from "./supabaseAdmin";
import { AppUser } from "./auth";
import { getLeetCodeStatsForUser } from "./leetcode";
import { fetchGithubProfile } from "./github";

// Builds a compact, plain-text summary of what we know about the user
// so the AI chat assistant can answer questions like "what should I
// work on next" or "how am I doing" instead of replying with zero
// context. Kept short on purpose — this gets prepended to every chat
// prompt, so a bloated context here means slower + more expensive
// calls for no real benefit.
export async function buildUserContext(user: AppUser): Promise<string> {
  const lines: string[] = [];

  lines.push(`User: ${user.username}${user.name ? ` (${user.name})` : ""}`);
  if (user.bio) lines.push(`Bio: ${user.bio}`);

  const { data: roadmaps } = await supabaseAdmin
    .from("roadmaps")
    .select("id, title")
    .eq("user_id", user.id);

  if (!roadmaps || roadmaps.length === 0) {
    lines.push("Roadmaps: none created yet.");
  } else {
    const roadmapIds = roadmaps.map((r) => r.id);
    const { data: tasks } = await supabaseAdmin
      .from("roadmap_tasks")
      .select("roadmap_id, title, completed, priority, due_date")
      .in("roadmap_id", roadmapIds);

    const today = new Date().toISOString().slice(0, 10);
    const byRoadmap = new Map<number, any[]>();
    for (const t of tasks || []) {
      const list = byRoadmap.get(t.roadmap_id) || [];
      list.push(t);
      byRoadmap.set(t.roadmap_id, list);
    }

    lines.push("Roadmaps:");
    for (const roadmap of roadmaps) {
      const roadmapTasks = byRoadmap.get(roadmap.id) || [];
      const total = roadmapTasks.length;
      const completed = roadmapTasks.filter((t) => t.completed).length;
      const progress = total === 0 ? 0 : Math.floor((completed * 100) / total);
      const overdue = roadmapTasks.filter((t) => !t.completed && t.due_date && t.due_date < today).length;
      const nextPending = roadmapTasks.find((t) => !t.completed);

      lines.push(
        `- "${roadmap.title}": ${progress}% complete (${completed}/${total} tasks)` +
          (overdue > 0 ? `, ${overdue} overdue` : "") +
          (nextPending ? `, next task: "${nextPending.title}" (${nextPending.priority})` : "")
      );
    }
  }

  if (user.leetcode_username) {
    try {
      const stats = await getLeetCodeStatsForUser(user.id);
      if (stats) {
        lines.push(
          `LeetCode (${stats.username}): ${stats.totalSolved} solved (Easy ${stats.easySolved}, Medium ${stats.mediumSolved}, Hard ${stats.hardSolved}), rank ~${stats.ranking}.`
        );
      }
    } catch {
      // no cached stats yet — skip silently
    }
  }

  if (user.github_username) {
    try {
      const profile = await fetchGithubProfile(user.github_username);
      if (profile) {
        lines.push(
          `GitHub (${user.github_username}): ${profile.public_repos} public repos, ${profile.followers} followers.`
        );
      }
    } catch {
      // github lookup failed — skip silently
    }
  }

  return lines.join("\n");
}