"use client"

import { AlertCircle, X } from "lucide-react"

interface InlineToastProps {
  message: string
  onDismiss: () => void
}

// A minimal, dependency-free toast for surfacing background-save
// failures (e.g. an optimistic checkbox update that got reverted).
// Renders nothing when there's no message.
export default function InlineToast({ message, onDismiss }: InlineToastProps) {
  if (!message) return null

  return (
    <div className="fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-6">
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 shadow-lg dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-1 shrink-0 rounded-md p-0.5 transition hover:bg-red-100 dark:hover:bg-red-900"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}