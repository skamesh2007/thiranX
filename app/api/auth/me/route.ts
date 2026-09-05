import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, signToken, authResponseShape } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const token = signToken(user);
    return NextResponse.json(authResponseShape(user, token));
  } catch (err) {
    return errorResponse(err);
  }
}
