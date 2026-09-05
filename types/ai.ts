export interface GenerateRoadmapRequest {
  goal: string;
}

export interface AIRoadmapResponse {
  roadmapId: number;
  title: string;
  tasks: string[];
}

export interface AIInsightsResponse {
  strengths: string[];
  weaknesses: string[];
  nextActions: string[];
}

export interface AskQuestionRequest {
  question: string;
}
