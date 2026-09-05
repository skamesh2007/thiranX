"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import ChangePasswordCard from "@/components/settings/ChangePasswordCard"

export default function PrivacySettingsPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Privacy &amp; Security</h1>
          <p className="text-muted-foreground">
            Manage your password and account security
          </p>
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  )
}
