export interface LeetCodeUsernameRequest {
  leetcodeUsername: string;
}

export interface LeetCodeUsernameResponse {
  username: string | null;
}

export interface RecentSubmission {
  title: string;
  titleSlug: string;
  statusDisplay: string;
  lang: string;
  timestamp: string;
}

export interface LeetCodeStatsResponse {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  recentSubmissions: RecentSubmission[];
}