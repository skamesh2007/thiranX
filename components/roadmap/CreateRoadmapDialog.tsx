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

import { createRoadmap } from "@/services/roadmapService";

interface Props {
  onCreated: () => Promise<void>;
}

export default function CreateRoadmapDialog({
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      await createRoadmap({
        title,
        description,
      });

      setTitle("");
      setDescription("");

      setOpen(false);

      await onCreated();
    } catch (error) {
      console.error(
        "Failed to create roadmap",
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
        <Button>
          + New Roadmap
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create Roadmap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
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
              : "Create Roadmap"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}