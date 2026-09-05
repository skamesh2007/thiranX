export interface CalendarItem {
  kind: "roadmap_task" | "todo";
  id: number;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  completed: boolean;
  roadmapId?: number;
  roadmapTitle?: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  items: CalendarItem[];
}

export interface CalendarMonthResponse {
  month: string; // YYYY-MM
  days: CalendarDay[];
}

export interface AiPlanDay {
  date: string;
  items: { kind: "roadmap_task" | "todo"; id: number; title: string }[];
}

export interface AiPlanResponse {
  scheduled: number;
  days: AiPlanDay[];
}