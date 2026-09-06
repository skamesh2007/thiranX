"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Video,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getTaskResources, refreshTaskResources } from "@/services/resourceService";
import { TaskResource, ResourceType } from "@/types/resources";

const iconByType: Record<ResourceType, typeof Video> = {
  video: Video,
  article: FileText,
  documentation: BookOpen,
  course: GraduationCap,
};

interface Props {
  taskId: number;
  taskTitle: string;
}

export default function TaskResourcesDialog({ taskId, taskTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resources, setResources] = useState<TaskResource[] | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTaskResources(taskId);
      setResources(data.resources);
      setIsFallback(data.source === "fallback");
    } catch (err) {
      console.error("Failed to load resources", err);
      setError("Couldn't load learning resources. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && resources === null) {
      void load();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const data = await refreshTaskResources(taskId);
      setResources(data.resources);
      setIsFallback(data.source === "fallback");
    } catch (err) {
      console.error("Failed to refresh resources", err);
      setError("Couldn't refresh resources. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/70"
          title="Find learning resources for this task"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Resources
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6">Learn: {taskTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {!loading && !error && isFallback && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                These are generic suggestions, not AI-tailored picks — the
                AI service didn't respond. Try &quot;Find different
                resources&quot; again in a moment.
              </span>
            </div>
          )}

          {loading ? (
            <>
              <div className="h-14 animate-pulse rounded-xl border bg-muted" />
              <div className="h-14 animate-pulse rounded-xl border bg-muted" />
              <div className="h-14 animate-pulse rounded-xl border bg-muted" />
            </>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            resources?.map((resource, i) => {
              const Icon = iconByType[resource.type];
              return (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border p-3 transition hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                    <Icon className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {resource.platform} • {resource.type}
                    </p>
                  </div>
                </a>
              );
            })
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Find different resources
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}