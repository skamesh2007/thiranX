"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
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

import { login } from "@/services/authService"
import { useAuthStore } from "@/store/authStore"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const loginStore = useAuthStore((state) => state.login)

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)

      const response = await login({ identifier, password })

      // Store JWT in a cookie for Next.js middleware (SSR-level route protection)
      document.cookie = `token=${response.token}; path=/; max-age=86400; SameSite=Lax`

      // Store in Zustand (persisted to localStorage) for client-side access
      loginStore(response.token, {
        username: response.username,
        email: response.email,
        name: response.name,
        bio: response.bio,
        linkedinUrl: response.linkedinUrl,
        role: response.role,
      })

      router.push("/dashboard")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Backend sends: { error: "No account found with username '...'" }
        // or: { error: "Incorrect password for '...'" }
        const data = err.response?.data
        const message =
          data?.error ||
          data?.message ||
          (typeof data === "string" ? data : null) ||
          "Login failed. Please try again."
        setError(message)
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
              <h1 className="text-xl font-bold">Welcome to ThiranX</h1>
              <FieldDescription>
                Don&apos;t have an account?{" "}
                <a
                  href="/auth/register"
                  className="font-medium text-emerald-600 underline underline-offset-4 dark:text-emerald-400"
                >
                  Register
                </a>
              </FieldDescription>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="identifier">Username or Email</FieldLabel>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username or email"
                required
                autoComplete="username"
                className="h-12 text-base"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
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
            </Field>

            <Button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-xl text-base font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}