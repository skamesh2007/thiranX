import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser, signToken, authResponseShape } from "@/lib/server/auth";
import { updateProfileSchema } from "@/lib/server/validations";
import { ApiException, errorResponse } from "@/lib/server/errors";

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getAuthUser(req);
    const body = updateProfileSchema.parse(await req.json());

    if (body.username !== currentUser.username) {
      const { data: taken } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("username", body.username)
        .maybeSingle();
      if (taken) throw new ApiException(400, `Username '${body.username}' is already taken`);
    }

    const { data: updated, error } = await supabaseAdmin
      .from("users")
      .update({
        username: body.username,
        name: body.name ?? null,
        bio: body.bio ?? null,
        linkedin_url: body.linkedinUrl || null,
      })
      .eq("id", currentUser.id)
      .select("id, username, email, name, bio, linkedin_url, role")
      .single();

    if (error || !updated) throw new ApiException(500, "Failed to update profile");

    const token = signToken(updated);
    return NextResponse.json(authResponseShape(updated as any, token));
  } catch (err) {
    return errorResponse(err);
  }
}