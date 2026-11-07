import "server-only";

import webpush from "web-push";
import { dayTitle, isWritten, scheduleFor, WEEKS } from "@/lib/curriculum";

// Web push needs a VAPID key pair. The public key is NEXT_PUBLIC_VAPID_PUBLIC_KEY (also used by the browser
// to subscribe); the private key is VAPID_PRIVATE_KEY, set by the site owner in Vercel. Without them, nothing is sent.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://engram-neuroai.vercel.app";
let configured: boolean | null = null;

export function pushReady(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  configured = Boolean(pub && priv);
  if (configured) webpush.setVapidDetails(process.env.VAPID_SUBJECT || SITE, pub!, priv!);
  return configured;
}

export type Sub = { endpoint: string; p256dh: string; auth: string };
export type Note = { title: string; body: string; url: string; tag: string };

/** Sends one notification. Returns "gone" when the push service says the subscription no longer exists. */
export async function sendPush(sub: Sub, note: Note): Promise<"ok" | "gone" | "error"> {
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(note), { TTL: 6 * 3600, urgency: "high" });
    return "ok";
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    return code === 404 || code === 410 ? "gone" : "error";
  }
}

/** The morning message for a learner's local date, or null on rest days and outside the programme. */
export function morningNote(start: string, localDay: string): Note | null {
  const s = scheduleFor(localDay, start);
  if (s.kind !== "lesson") return null;
  const w = s.week, d = s.day;
  const title = isWritten(w) ? dayTitle(w, d) : WEEKS[w - 1].title;
  const first = w === 1 && d === 1;
  return {
    title: first ? "Engram starts today" : `Week ${w}, Day ${d}${d === 6 ? ": Forge" : ""}`,
    body: first ? `Day 1: ${title}. Good luck, and enjoy it.` : `${title}. Start early and it is done by mid-morning.`,
    url: `${SITE}/learn/w${String(w).padStart(3, "0")}/d${d}`,
    tag: `engram-${w}-${d}`,
  };
}
