"use client"

import { useState } from "react"
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"

import { changePassword } from "@/services/authService"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ApiError {
  response?: {
    data?: {
      error?: string
    }
  }
}

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggleVisible: () => void
  autoComplete?: string
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />

        <button
          type="button"
          onClick={onToggleVisible}
          tabIndex={-1}
          aria-label={
            visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const resetMessages = () => {
    setSuccess("")
    setError("")
  }

  const handleSubmit = async () => {
    resetMessages()

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from your current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      await changePassword({
        currentPassword,
        newPassword,
      })

      setSuccess("Password changed successfully")

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
    } catch (err) {
      const apiError = err as ApiError

      setError(apiError.response?.data?.error ?? "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !currentPassword || !newPassword || !confirmPassword

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Use a strong password you don&apos;t use anywhere else.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <PasswordField
          id="current-password"
          label="Current Password"
          value={currentPassword}
          onChange={(value) => {
            setCurrentPassword(value)
            resetMessages()
          }}
          visible={showCurrent}
          onToggleVisible={() => setShowCurrent((v) => !v)}
          autoComplete="current-password"
        />

        <PasswordField
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={(value) => {
            setNewPassword(value)
            resetMessages()
          }}
          visible={showNew}
          onToggleVisible={() => setShowNew((v) => !v)}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value)
            resetMessages()
          }}
          visible={showConfirm}
          onToggleVisible={() => setShowConfirm((v) => !v)}
          autoComplete="new-password"
        />

        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long.
        </p>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50/60 px-3 py-2 text-sm text-green-600 dark:border-green-900 dark:bg-green-950/20">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isDisabled} className="w-full">
          {loading ? "Updating..." : "Change Password"}
        </Button>
      </CardContent>
    </Card>
  )
}