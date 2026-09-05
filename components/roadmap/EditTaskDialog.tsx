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

import { updateTask } from "@/services/taskService";

interface Props {
  taskId: number;
  title: string;
  description: string;
  completed: boolean;
  onUpdated: () => Promise<void>;
}

export default function EditTaskDialog({
  taskId,
  title: initialTitle,
  description: initialDescription,
  completed,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] =
    useState(initialTitle);

  const [description, setDescription] =
    useState(initialDescription);

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      await updateTask(taskId, { title, description, completed })
      await onUpdated()
      setOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Pencil className="h-4 w-4 cursor-pointer text-muted-foreground" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Task
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

          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
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