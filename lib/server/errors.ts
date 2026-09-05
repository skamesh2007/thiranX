import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiException extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof ApiException) {
    return NextResponse.json(
      { error: err.message, ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}) },
      { status: err.status }
    );
  }

  // Zod validation errors were previously falling through to the
  // generic 500 branch below, showing users "Internal server error"
  // for things like a too-short password. Surface them as a proper
  // 400 with per-field messages instead.
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join(".") || "form";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}