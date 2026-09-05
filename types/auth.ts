export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  name: string;
  bio: string;
  role: string;
}

/** Shape returned by backend on errors */
export interface ApiError {
  error: string;
  /** Present on validation errors — maps field name → message */
  fieldErrors?: Record<string, string>;
}

export type User = {
  username: string;
  email: string;
  name?: string;
  bio?: string;
  role?: string;
};

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}