import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { hashPassword, signToken, authResponseShape } from "@/lib/server/auth";
import { registerSchema } from "@/lib/server/validations";
import { ApiException, errorResponse } from "@/lib/server/errors";

export async function POST(req: NextRequest) {
  try {
    const body = registerSchema.parse(await req.json());

    const { data: usernameTaken } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", body.username)
      .maybeSingle();
    if (usernameTaken) {
      throw new ApiException(400, `Username '${body.username}' is already taken`);
    }

    const { data: emailTaken } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", body.email)
      .maybeSingle();
    if (emailTaken) {
      throw new ApiException(400, `Email '${body.email}' is already registered`);
    }

    const passwordHash = await hashPassword(body.password);

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({ username: body.username, email: body.email, password_hash: passwordHash, role: "USER" })
      .select("id, username, email, name, bio, role")
      .single();

    if (error || !user) throw new ApiException(500, "Failed to create user");

    const token = signToken(user);
    return NextResponse.json(authResponseShape(user as any, token));
  } catch (err) {
    return errorResponse(err);
  }
}
