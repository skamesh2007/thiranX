import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { ApiException, errorResponse } from "@/lib/server/errors";
import { generateText } from "@/lib/server/gemini";
import { buildUserContext } from "@/lib/server/aiChatContext";

function buildPrompt(context: string, question: string) {
  return `You are the AI career coach inside ThiranX, a learning roadmap and
progress-tracking app. Answer the user's question using the context
below when it's relevant. Be specific and reference their actual
roadmaps/progress/stats when it helps — don't just give generic advice
if you have real data to work with. Keep the answer concise and
conversational (a few sentences, or a short list if needed).

--- User context ---
${context}
--- End of context ---

Question: ${question}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    const question = req.nextUrl.searchParams.get("question");
    if (!question || !question.trim()) throw new ApiException(400, "Question must not be empty");

    const context = await buildUserContext(user);
    const answer = await generateText(buildPrompt(context, question));

    return NextResponse.json(answer);
  } catch (err) {
    return errorResponse(err);
  }
}