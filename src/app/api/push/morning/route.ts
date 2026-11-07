import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { morningNote, pushReady, sendPush, type Sub } from "@/lib/push";

// Called every 15 minutes by the database job public.dispatch_morning_reminders(), with the subscriptions of
// learners whose reminder time has just passed. The message is worked out here from the learner's own schedule,
// so the request can only ever deliver Engram's morning reminder to a subscription its sender already holds.
type Item = Sub & { start_date: string; local_day: string };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: NextRequest) {
  if (!pushReady()) return NextResponse.json({ sent: 0, reason: "push keys not set" });
  const body = await request.json().catch(() => null);
  const items: Item[] = Array.isArray(body?.items) ? body.items.slice(0, 5000) : [];
  const valid = items.filter((i) => typeof i?.endpoint === "string" && i.endpoint.startsWith("https://") && typeof i.p256dh === "string"
    && typeof i.auth === "string" && DATE.test(String(i.start_date)) && DATE.test(String(i.local_day)));

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  let sent = 0, skipped = 0, gone = 0;
  await Promise.all(valid.map(async (i) => {
    const note = morningNote(i.start_date, i.local_day);
    if (!note) { skipped++; return; }
    const r = await sendPush(i, note);
    if (r === "ok") sent++;
    if (r === "gone") { gone++; await sb.rpc("forget_push_subscription", { p_endpoint: i.endpoint }); }
  }));
  return NextResponse.json({ sent, skipped, gone });
}
