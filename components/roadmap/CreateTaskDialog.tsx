"use client";

import { useState } from "react";

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

import { createTask } from "@/services/taskService";

interface Props {
  roadmapId: number;
  onCreated: () => Promise<void>;
}

export default function CreateTaskDialog({
  roadmapId,
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      await createTask(roadmapId, {
        title,
        description,
      });

      setTitle("");
      setDescription("");

      setOpen(false);

      await onCreated();
    } catch (error) {
      console.error(
        "Failed to create task",
        error
      );
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
        <Button size="sm">
          + Add Task
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}