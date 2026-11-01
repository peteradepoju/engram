import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// The tutor uses Google Gemini. Set GEMINI_API_KEY in the Vercel project settings
// (and optionally GEMINI_MODEL). Without a key the tutor explains that it is not set up.
const DAILY_LIMIT = 40;

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are the tutor on Engram, a free course that teaches NeuroAI (neuroscience, machine learning and deep learning) from scratch to research level.
Teach like a patient, rigorous university tutor:
- Start from intuition, then give the maths, then a tiny example. Use plain words and short paragraphs.
- Write maths in LaTeX between $ signs.
- If the learner asks for an exercise answer, give a hint first and ask what they tried. Give the full answer only if they ask again.
- When an idea has a brain side and a machine side, mention both briefly.
- Say when something is uncertain or debated in the research. Never invent papers or citations; if you mention a paper, give authors and year only when you are sure.
- Use British spelling. Never use em dashes. Keep answers under 250 words unless asked for more.`;

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Please sign in to use the tutor." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const messages: Msg[] = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
  if (!messages.length || messages.some((m) => typeof m?.content !== "string" || m.content.length > 4000)) {
    return NextResponse.json({ error: "Empty or too long a question." }, { status: 400 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ reply: "The tutor is not switched on yet: the site owner needs to add a Gemini API key." });

  const { data: count, error: usageErr } = await supabase.rpc("bump_tutor_usage");
  if (usageErr) return NextResponse.json({ error: "Could not check your daily limit." }, { status: 500 });
  if ((count as number) > DAILY_LIMIT) {
    return NextResponse.json({ reply: `You have used today's ${DAILY_LIMIT} tutor questions. They reset at midnight UTC.` });
  }

  const context = `Lesson: ${String(body.lessonTitle ?? "").slice(0, 200)} (${String(body.lessonId ?? "").slice(0, 20)}).` +
    (body.selection ? `\nThe learner selected this text on the page:\n"""${String(body.selection).slice(0, 1500)}"""` : "");

  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${SYSTEM}\n\n${context}` }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "The tutor is busy. Try again in a minute." }, { status: 502 });
  const data = await res.json();
  const reply: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  return NextResponse.json({ reply: reply.replace(/—/g, ", ") || "I have no answer for that. Try rephrasing." });
}
