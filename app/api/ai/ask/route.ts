import { NextRequest, NextResponse } from "next/server";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { generateText } from "@/lib/server/gemini";

export async function GET(req: NextRequest) {
  try {
    const question = req.nextUrl.searchParams.get("question");
    if (!question || !question.trim()) throw new ApiException(400, "Question must not be empty");

    const answer = await generateText(question);
    return NextResponse.json(answer);
  } catch (err) {
    return errorResponse(err);
  }
}
