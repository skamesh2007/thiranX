export interface Roadmap {
  id: number;
  title: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export interface RoadmapTask {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface CreateRoadmapRequest {
  title: string;
  description: string;
}

export interface UpdateRoadmapRequest {
  title: string;
  description: string;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface RecommendedTask {
  taskId: number;
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  estimatedHours: number | null;
}

export interface RoadmapAnalyticsResponse {
  roadmapId: number;
  roadmapTitle: string;

  completionPercentage: number;
  completedTasks: number;
  remainingTasks: number;

  overdueTasks: number;
  highPriorityRemaining: number;

  estimatedHoursRemaining: number;
  projectedCompletionDays: number;

  nextRecommendedTasks: RecommendedTask[];
}