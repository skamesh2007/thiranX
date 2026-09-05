export interface CareerMomentumResponse {
  strongestRoadmap: string;
  strongestRoadmapProgress: number;

  weakestRoadmap: string;
  weakestRoadmapProgress: number;

  totalOverdueTasks: number;

  nearestCompletionRoadmap: string;
  nearestCompletionPercentage: number;

  momentumScore: number;
}

export interface DashboardResponse {
  roadmapProgress: number;
  completedTasks: number;
  totalTasks: number;
  activeProjects: number;
  leetcodeSolved: number;
}