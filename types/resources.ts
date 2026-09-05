export type ResourceType = "video" | "article" | "documentation" | "course";

export interface TaskResource {
  title: string;
  type: ResourceType;
  platform: string;
  searchQuery: string;
  url: string;
}

export interface TaskResourcesResponse {
  resources: TaskResource[];
  generatedAt: string;
  cached: boolean;
}