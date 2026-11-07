import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { pushReady, sendPush } from "@/lib/push";

// Sends a test notification to one of the signed-in learner's own devices.
export async function POST(request: NextRequest) {
  if (!pushReady()) return NextResponse.json({ error: "Notifications are not set up on the server yet." }, { status: 503 });
  const supabase = await createSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const { data: sub } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth").eq("endpoint", String(body?.endpoint ?? "")).maybeSingle();
  if (!sub) return NextResponse.json({ error: "This device is not registered for notifications." }, { status: 404 });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://engram-neuroai.vercel.app";
  const r = await sendPush(sub, { title: "Morning reminders are on", body: "You will get a nudge like this on every study day.", url: `${site}/today`, tag: "engram-test" });
  if (r === "gone") await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  return r === "ok" ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "The push service did not accept the message." }, { status: 502 });
}
