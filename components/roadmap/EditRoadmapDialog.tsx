"use client";

import { useState } from "react";

import { Pencil, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { updateRoadmap } from "@/services/roadmapService";

interface Props {
  roadmapId: number;
  initialTitle: string;
  initialDescription: string;
  onUpdated: () => Promise<void>;
}

export default function EditRoadmapDialog({
  roadmapId,
  initialTitle,
  initialDescription,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] =
    useState(initialTitle);

  const [description, setDescription] =
    useState(initialDescription);

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await updateRoadmap(
        roadmapId,
        {
          title,
          description,
        }
      );

      await onUpdated();

      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Edit roadmap"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Roadmap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <Textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}