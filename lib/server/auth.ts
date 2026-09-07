import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";
import { ApiException } from "./errors";

export interface AppUser {
  id: number;
  username: string;
  email: string;
  name: string | null;
  bio: string | null;
  leetcode_username: string | null;
  github_username: string | null;
  linkedin_url: string | null;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "1d";

export function signToken(user: Pick<AppUser, "id" | "username" | "role">) {
  return jwt.sign({ sub: user.username, uid: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Verifies the Bearer token and loads the user row. Throws ApiException(401) if missing/invalid. */
export async function getAuthUser(req: NextRequest): Promise<AppUser> {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw new ApiException(401, "Missing or invalid authorization header");

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    throw new ApiException(401, "Invalid or expired token");
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, username, email, name, bio, leetcode_username, github_username, linkedin_url, role")
    .eq("id", payload.uid)
    .single();

  if (error || !data) throw new ApiException(401, "User not found");

  return data as AppUser;
}

export function authResponseShape(user: AppUser, token: string) {
  return {
    token,
    username: user.username,
    email: user.email,
    name: user.name ?? "",
    bio: user.bio ?? "",
    linkedinUrl: user.linkedin_url ?? "",
    role: user.role,
  };
}