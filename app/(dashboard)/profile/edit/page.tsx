"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useAuthStore } from "@/store/authStore"
import { updateProfile } from "@/services/profileService"
import {
  getLeetCodeUsername,
  saveLeetCodeUsername,
} from "@/services/leetcodeService"
import { getGitHubUsername, saveGitHubUsername } from "@/services/githubService"

import EditProfileLoading from "@/components/loading/EditProfileLoading"
import ChangePasswordCard from "@/components/settings/ChangePasswordCard"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  username: string
  name: string
  bio: string
  leetcodeUsername: string
  githubUsername: string
}

interface FieldErrors {
  username?: string
  name?: string
  leetcodeUsername?: string
  githubUsername?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [form, setForm] = useState<FormState>({
    username: "",
    name: "",
    bio: "",
    leetcodeUsername: "",
    githubUsername: "",
  })

  const [original, setOriginal] = useState<FormState>({
    username: "",
    name: "",
    bio: "",
    leetcodeUsername: "",
    githubUsername: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // ── Load current values ──────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const [leetcodeRes, githubRes] = await Promise.allSettled([
        getLeetCodeUsername(),
        getGitHubUsername(),
      ])

      const initial: FormState = {
        username: user?.username ?? "",
        name: user?.name ?? "",
        bio: user?.bio ?? "",
        leetcodeUsername:
          leetcodeRes.status === "fulfilled"
            ? (leetcodeRes.value.username ?? "")
            : "",
        githubUsername:
          githubRes.status === "fulfilled"
            ? (githubRes.value.githubUsername ?? "")
            : "",
      }

      setForm(initial)
      setOriginal(initial)
      setLoading(false)
    }

    load()
  }, [user])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const hasChanges =
    form.username !== original.username ||
    form.name !== original.name ||
    form.bio !== original.bio ||
    form.leetcodeUsername !== original.leetcodeUsername ||
    form.githubUsername !== original.githubUsername

  const setField =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      setError(null)
      setSuccess(false)
    }

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    setSaving(true)
    setError(null)
    setFieldErrors({})
    setSuccess(false)

    try {
      const profileChanged =
        form.username !== original.username ||
        form.name !== original.name ||
        form.bio !== original.bio

      const leetcodeChanged =
        form.leetcodeUsername !== original.leetcodeUsername

      const githubChanged = form.githubUsername !== original.githubUsername

      // Run requests in parallel when multiple things changed
      const tasks: Promise<unknown>[] = []

      if (profileChanged) {
        tasks.push(
          updateProfile({
            username: form.username.trim(),
            name: form.name.trim(),
            bio: form.bio.trim(),
          })
        )
      }

      if (leetcodeChanged) {
        tasks.push(
          saveLeetCodeUsername({
            leetcodeUsername: form.leetcodeUsername.trim(),
          })
        )
      }

      if (githubChanged) {
        tasks.push(
          saveGitHubUsername({
            githubUsername: form.githubUsername.trim(),
          })
        )
      }

      const results = await Promise.allSettled(tasks)

      // Check for failures
      const failures = results.filter(
        (r) => r.status === "rejected"
      ) as PromiseRejectedResult[]
      if (failures.length > 0) {
        throw failures[0].reason
      }

      // Update store if profile info changed
      if (profileChanged && user) {
        setUser({
          ...user,
          username: form.username.trim(),
          name: form.name.trim(),
          bio: form.bio.trim(),
        })
      }

      const newOriginal = {
        username: form.username.trim(),
        name: form.name.trim(),
        bio: form.bio.trim(),
        leetcodeUsername: form.leetcodeUsername.trim(),
        githubUsername: form.githubUsername.trim(),
      }
      setForm(newOriginal)
      setOriginal(newOriginal)
      setSuccess(true)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (data?.fieldErrors && typeof data.fieldErrors === "object") {
          setFieldErrors(data.fieldErrors)
        } else {
          const message =
            data?.error ||
            data?.message ||
            (typeof data === "string" ? data : null) ||
            "Failed to save changes. Please try again."
          setError(message)
        }
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return <EditProfileLoading />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-muted"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">
            Update your account details
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Error banner */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  Profile updated successfully.
                </p>
              </div>
            )}

            {/* ── Account section ── */}
            <div>
              <p className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Account
              </p>
              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={setField("username")}
                    placeholder="Your username"
                    autoComplete="username"
                    aria-invalid={!!fieldErrors.username}
                    className="h-11 text-base"
                  />
                  {fieldErrors.username ? (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.username}
                    </p>
                  ) : (
                    <FieldDescription>
                      This is how others see you on ThiranX.
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">Display Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="Your full name (optional)"
                    autoComplete="name"
                    aria-invalid={!!fieldErrors.name}
                    className="h-11 text-base"
                  />
                  {fieldErrors.name ? (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.name}
                    </p>
                  ) : (
                    <FieldDescription>
                      Shown on your profile card.
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* ── Integrations section ── */}
            <div>
              <p className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Integrations
              </p>

              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="leetcode">LeetCode Username</FieldLabel>
                  <Input
                    id="leetcode"
                    type="text"
                    value={form.leetcodeUsername}
                    onChange={setField("leetcodeUsername")}
                    placeholder="e.g. neal_wu"
                    aria-invalid={!!fieldErrors.leetcodeUsername}
                    className="h-11 text-base"
                  />
                  {fieldErrors.leetcodeUsername ? (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.leetcodeUsername}
                    </p>
                  ) : (
                    <FieldDescription>
                      Links your LeetCode stats to your ThiranX profile.
                      {form.leetcodeUsername && original.leetcodeUsername && (
                        <> Clear and save to disconnect.</>
                      )}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="github">GitHub Username</FieldLabel>
                  <Input
                    id="github"
                    type="text"
                    value={form.githubUsername}
                    onChange={setField("githubUsername")}
                    placeholder="e.g. octocat"
                    aria-invalid={!!fieldErrors.githubUsername}
                    className="h-11 text-base"
                  />
                  {fieldErrors.githubUsername ? (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.githubUsername}
                    </p>
                  ) : (
                    <FieldDescription>
                      Links your GitHub stats to your ThiranX profile.
                      {form.githubUsername && original.githubUsername && (
                        <> Clear and save to disconnect.</>
                      )}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>

                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    maxLength={120}
                    placeholder="Tell others about yourself..."
                    className="min-h-[110px] w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none"
                  />

                  <FieldDescription>
                    {form.bio.length}/120 characters
                  </FieldDescription>
                </Field>
              </div>
            </div>

            {/* Save button */}
            <Button
              type="submit"
              disabled={saving || !hasChanges}
              className="h-12 w-full rounded-xl text-base font-medium"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}