"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"
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
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex size-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">ThiranX</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to ThiranX</h1>
              <FieldDescription>
                Don&apos;t have an account?{" "}
                <a
                  href="/auth/register"
                  className="underline underline-offset-4"
                >
                  Register
                </a>
              </FieldDescription>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-950">
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                className="h-12 text-base"
              />
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
