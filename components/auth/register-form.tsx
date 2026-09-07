"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import axios from "axios"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { register } from "@/services/authService"
import { useAuthStore } from "@/store/authStore"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const loginStore = useAuthStore((state) => state.login)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Top-level error (e.g. "Username already taken")
  const [error, setError] = useState<string | null>(null)

  // Per-field validation errors from backend bean-validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    try {
      setLoading(true)

      const response = await register({ username, email, password })

      setSuccess(true)

      // Auto-login: store token and redirect to dashboard
      document.cookie = `token=${response.token}; path=/; max-age=86400; SameSite=Lax`
      loginStore(response.token, {
        username: response.username,
        email: response.email,
        name: response.name,
        bio: response.bio,
        linkedinUrl: response.linkedinUrl,
        role: response.role,
      })

      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data

        if (data?.fieldErrors && typeof data.fieldErrors === "object") {
          // Bean-validation errors: highlight individual fields
          setFieldErrors(data.fieldErrors)
        } else {
          // Business-logic errors: "Username 'x' is already taken", etc.
          const message =
            data?.error ||
            data?.message ||
            (typeof data === "string" ? data : null) ||
            "Registration failed. Please try again."
          setError(message)
        }
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("mx-auto w-full max-w-md", className)} {...props}>
      <div className="rounded-3xl border bg-card p-8 shadow-sm">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <Image
                src="/images/logo.png"
                alt="ThiranX"
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl object-cover"
                priority
              />
              <h1 className="text-xl font-bold">Create your ThiranX account</h1>
              <FieldDescription>
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="font-medium text-emerald-600 underline underline-offset-4 dark:text-emerald-400"
                >
                  Sign in
                </a>
              </FieldDescription>
            </div>

            {/* Top-level error banner */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Account created! Redirecting…
                </p>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="At least 3 characters"
                required
                autoComplete="username"
                aria-invalid={!!fieldErrors.username}
                className="h-12 text-base"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                className="h-12 text-base"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.password}
                  className="h-12 pr-11 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </Field>

            <Button
              type="submit"
              disabled={loading || success}
              className="h-14 w-full rounded-xl text-base font-medium"
            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}