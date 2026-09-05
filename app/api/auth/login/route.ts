import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { comparePassword, signToken, authResponseShape } from "@/lib/server/auth";
import { loginSchema } from "@/lib/server/validations";
import { ApiException, errorResponse } from "@/lib/server/errors";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = loginSchema.parse(await req.json());
    const looksLikeEmail = identifier.includes("@");

    const column = looksLikeEmail ? "email" : "username";
    let { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq(column, identifier)
      .maybeSingle();

    // username lookup falls back to email, mirroring the Java service
    if (!user && !looksLikeEmail) {
      const fallback = await supabaseAdmin.from("users").select("*").eq("email", identifier).maybeSingle();
      user = fallback.data;
    }

    if (!user) {
      throw new ApiException(400, `No account found with ${looksLikeEmail ? "email" : "username"} '${identifier}'`);
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      throw new ApiException(400, `Incorrect password for '${user.username}'`);
    }

    const token = signToken(user);
    return NextResponse.json(authResponseShape(user, token));
  } catch (err) {
    return errorResponse(err);
  }
}
