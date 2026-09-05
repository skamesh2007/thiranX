import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getAuthUser, comparePassword, hashPassword } from "@/lib/server/auth";
import { changePasswordSchema } from "@/lib/server/validations";
import { ApiException, errorResponse } from "@/lib/server/errors";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const body = changePasswordSchema.parse(await req.json());

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", authUser.id)
      .single();

    const valid = await comparePassword(body.currentPassword, user!.password_hash);
    if (!valid) throw new ApiException(400, "Current password is incorrect");

    const newHash = await hashPassword(body.newPassword);
    await supabaseAdmin.from("users").update({ password_hash: newHash }).eq("id", authUser.id);

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}
