"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const TIMES = Array.from({ length: 21 }, (_, i) => { const m = 4 * 60 + i * 30; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; });

function keyBytes(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type State = "checking" | "unsupported" | "ios-install" | "no-key" | "denied" | "off" | "on";

/** Morning push notifications: turn them on for this device, choose the time, send a test. */
export function Reminders({ userId, enabled, time, onChange }: {
  userId: string; enabled: boolean; time: string; onChange: (p: { reminders_enabled?: boolean; reminder_time?: string }) => void;
}) {
  const [state, setState] = useState<State>("checking");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setState(ios && !standalone ? "ios-install" : "unsupported"); return; }
      if (!KEY) { setState("no-key"); return; }
      if (Notification.permission === "denied") { setState("denied"); return; }
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function turnOn() {
    setBusy(true); setMsg("");
    try {
      if ((await Notification.requestPermission()) !== "granted") { setState("denied"); return; }
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(KEY) }));
      const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const { error } = await supabase().from("push_subscriptions").upsert({ endpoint: j.endpoint, user_id: userId, p256dh: j.keys.p256dh, auth: j.keys.auth });
      if (error) throw new Error(error.message);
      if (!enabled) await save({ reminders_enabled: true });
      setState("on");
      await test(j.endpoint);
    } catch (e) {
      setMsg(`Could not turn on notifications: ${(e as Error).message}`);
    } finally { setBusy(false); }
  }

  async function turnOff() {
    setBusy(true); setMsg("");
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) { await supabase().from("push_subscriptions").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
    setState("off"); setBusy(false); setMsg("Notifications are off on this device.");
  }

  async function test(endpoint?: string) {
    const ep = endpoint ?? (await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription())?.endpoint;
    if (!ep) return;
    const r = await fetch("/api/push/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: ep }) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? "A test notification is on its way." : j.error ?? "The test notification could not be sent.");
  }

  async function save(patch: { reminders_enabled?: boolean; reminder_time?: string }) {
    onChange(patch);
    const { error } = await supabase().from("profiles").update(patch).eq("id", userId);
    setMsg(error ? `Could not save: ${error.message}` : "Saved");
  }

  return (
    <section id="reminders" className="card scroll-mt-20 space-y-3 p-5">
      <h2 className="font-semibold">Morning reminders</h2>
      <p className="text-sm text-ink-2">A notification on every study day, Monday to Saturday from your Day 1, with that day&apos;s lesson. Tap it to open the lesson. No reminders on Sundays or in rest weeks.</p>

      {state === "ios-install" ? <p className="text-sm text-warn">On iPhone and iPad, notifications work once Engram is on your Home Screen: tap Share, then Add to Home Screen, open Engram from there and come back to this page.</p> : null}
      {state === "unsupported" ? <p className="text-sm text-warn">This browser cannot receive notifications. Try Chrome, Edge or Firefox, or the installed app on your phone.</p> : null}
      {state === "no-key" ? <p className="text-sm text-ink-3">Notifications are not switched on for the site yet.</p> : null}
      {state === "denied" ? <p className="text-sm text-warn">Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then reload this page.</p> : null}

      {state === "off" ? <button className="btn" disabled={busy} onClick={turnOn}>{busy ? "Turning on…" : "Turn on notifications on this device"}</button> : null}
      {state === "on" ? (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-surface-2 px-3 py-2 text-sm">On for this device</span>
          <button className="btn" disabled={busy} onClick={() => test()}>Send a test</button>
          <button className="btn" disabled={busy} onClick={turnOff}>Turn off here</button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="text-ink-2">Remind me at (your local time)</span>
          <select className="input mt-1" value={time} onChange={(e) => save({ reminder_time: e.target.value })}>
            {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => save({ reminders_enabled: e.target.checked })} /> Send morning reminders
        </label>
      </div>
      <p className="text-xs text-ink-3">Turn notifications on separately on each device you use, for example your phone and your laptop. Reminders follow the time zone above.</p>
      {msg ? <p className="text-sm text-ink-3">{msg}</p> : null}
    </section>
  );
}
