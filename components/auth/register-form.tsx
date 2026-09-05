"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { register } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Top-level error (e.g. "Username already taken")
  const [error, setError] = useState<string | null>(null);

  // Per-field validation errors from backend bean-validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    try {
      setLoading(true);

      const response = await register({ username, email, password });

      setSuccess(true);

      // Auto-login: store token and redirect to dashboard
      document.cookie = `token=${response.token}; path=/; max-age=86400; SameSite=Lax`;
      loginStore(response.token, {
        username: response.username,
        email: response.email,
        role: response.role,
      });

      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        if (data?.fieldErrors && typeof data.fieldErrors === "object") {
          // Bean-validation errors: highlight individual fields
          setFieldErrors(data.fieldErrors);
        } else {
          // Business-logic errors: "Username 'x' is already taken", etc.
          const message =
            data?.error ||
            data?.message ||
            (typeof data === "string" ? data : null) ||
            "Registration failed. Please try again.";
          setError(message);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">ThiranX</span>
            </a>
            <h1 className="text-xl font-bold">Create your ThiranX account</h1>
            <FieldDescription>
              Already have an account?{" "}
              <a href="/auth/login" className="underline underline-offset-4">
                Sign in
              </a>
            </FieldDescription>
          </div>

          {/* Top-level error banner */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-950">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 dark:border-green-800 dark:bg-green-950">
              <p className="text-sm text-green-700 dark:text-green-400">
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
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </Field>

          <Button type="submit" disabled={loading || success} className="w-full">
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}