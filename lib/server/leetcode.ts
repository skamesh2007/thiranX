import { supabaseAdmin } from "./supabaseAdmin";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

export interface LeetCodeFetchResult {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  recentSubmissions: {
    title: string;
    titleSlug: string;
    statusDisplay: string;
    lang: string;
    timestamp: string;
  }[];
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeFetchResult> {
  const query = `{ matchedUser(username: "${username}") { username profile { ranking } submitStats { acSubmissionNum { difficulty count } } } recentSubmissionList(username: "${username}", limit: 10) { title titleSlug statusDisplay lang timestamp } }`;

  const res = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query }),
  });

  const root = await res.json();
  const user = root?.data?.matchedUser;
  if (!user) throw new Error("LeetCode user not found");

  const result: LeetCodeFetchResult = {
    username,
    ranking: user.profile?.ranking ?? 0,
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    recentSubmissions: (root?.data?.recentSubmissionList || []).map((s: any) => ({
      title: s.title,
      titleSlug: s.titleSlug,
      statusDisplay: s.statusDisplay,
      lang: s.lang,
      timestamp: s.timestamp,
    })),
  };

  for (const stat of user.submitStats?.acSubmissionNum || []) {
    if (stat.difficulty === "All") result.totalSolved = stat.count;
    if (stat.difficulty === "Easy") result.easySolved = stat.count;
    if (stat.difficulty === "Medium") result.mediumSolved = stat.count;
    if (stat.difficulty === "Hard") result.hardSolved = stat.count;
  }

  return result;
}

/** Refreshes and persists LeetCode stats for a user, mirroring LeetCodeService.refreshLeetCodeStats. */
export async function refreshLeetCodeStatsForUser(userId: number, leetcodeUsername: string) {
  const stats = await fetchLeetCodeStats(leetcodeUsername);

  const { data: existing } = await supabaseAdmin
    .from("leetcode_stats")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let statsId: number;

  if (existing) {
    statsId = existing.id;
    await supabaseAdmin
      .from("leetcode_stats")
      .update({
        username: stats.username,
        ranking: stats.ranking,
        total_solved: stats.totalSolved,
        easy_solved: stats.easySolved,
        medium_solved: stats.mediumSolved,
        hard_solved: stats.hardSolved,
        last_updated: new Date().toISOString(),
      })
      .eq("id", statsId);

    await supabaseAdmin.from("leetcode_recent_submissions").delete().eq("leetcode_stats_id", statsId);
  } else {
    const { data: inserted, error } = await supabaseAdmin
      .from("leetcode_stats")
      .insert({
        user_id: userId,
        username: stats.username,
        ranking: stats.ranking,
        total_solved: stats.totalSolved,
        easy_solved: stats.easySolved,
        medium_solved: stats.mediumSolved,
        hard_solved: stats.hardSolved,
        last_updated: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !inserted) throw new Error("Failed to save LeetCode stats");
    statsId = inserted.id;
  }

  if (stats.recentSubmissions.length > 0) {
    await supabaseAdmin.from("leetcode_recent_submissions").insert(
      stats.recentSubmissions.map((s) => ({
        leetcode_stats_id: statsId,
        title: s.title,
        title_slug: s.titleSlug,
        status_display: s.statusDisplay,
        lang: s.lang,
        submission_timestamp: s.timestamp,
      }))
    );
  }

  return statsId;
}

export async function getLeetCodeStatsForUser(userId: number) {
  const { data: stats } = await supabaseAdmin
    .from("leetcode_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!stats) return null;

  const { data: submissions } = await supabaseAdmin
    .from("leetcode_recent_submissions")
    .select("title, title_slug, status_display, lang, submission_timestamp")
    .eq("leetcode_stats_id", stats.id);

  return {
    username: stats.username,
    ranking: stats.ranking,
    totalSolved: stats.total_solved,
    easySolved: stats.easy_solved,
    mediumSolved: stats.medium_solved,
    hardSolved: stats.hard_solved,
    recentSubmissions: (submissions || []).map((s) => ({
      title: s.title,
      titleSlug: s.title_slug,
      statusDisplay: s.status_display,
      lang: s.lang,
      timestamp: s.submission_timestamp,
    })),
  };
}
