"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** A one-line prompt on the Today page until morning reminders are switched on (or dismissed) on this device. */
export function ReminderNudge() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    (async () => {
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
      try { if (localStorage.getItem("engram-reminder-nudge") === "1") return; } catch {}
      if (Notification.permission === "denied") return;
      const sub = await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription();
      setShow(!sub);
    })().catch(() => {});
  }, []);
  if (!show) return null;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
      <span aria-hidden="true">🔔</span>
      <span className="flex-1 text-ink-2">Get a notification every study morning with that day&apos;s lesson.</span>
      <Link href="/settings#reminders" className="btn !py-1.5">Turn on</Link>
      <button className="text-ink-3 hover:text-ink" aria-label="Dismiss" onClick={() => { try { localStorage.setItem("engram-reminder-nudge", "1"); } catch {} setShow(false); }}>✕</button>
    </div>
  );
}
