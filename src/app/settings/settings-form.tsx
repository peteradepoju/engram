"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/use-user";

const ZONES = ["Africa/Lagos", "Africa/Johannesburg", "Africa/Nairobi", "Africa/Cairo", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/Toronto", "America/Vancouver", "America/New_York", "Asia/Kolkata", "Asia/Singapore", "Australia/Sydney", "Australia/Perth", "UTC"];

export function SettingsForm() {
  const { user, profile, setProfile, ready } = useProfile();
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  if (!ready || !user || !profile) return <p className="mt-6 text-ink-3">Loading…</p>;

  async function save(patch: Partial<typeof profile>) {
    const next = { ...profile!, ...patch };
    setProfile(next);
    const { error } = await supabase().from("profiles").upsert({
      id: user!.id, display_name: next.display_name, timezone: next.timezone, start_date: next.start_date, tutor_enabled: next.tutor_enabled,
    });
    setMsg(error ? `Could not save: ${error.message}` : "Saved");
  }

  const feed = typeof window !== "undefined" && profile.calendar_token ? `${window.location.origin}/api/calendar/${profile.calendar_token}` : "";
  const isMonday = new Date(profile.start_date + "T12:00:00Z").getUTCDay() === 1;

  return (
    <div className="mt-6 space-y-6">
      <section className="card space-y-4 p-5">
        <label className="block text-sm"><span className="text-ink-2">Name</span>
          <input className="input mt-1" defaultValue={profile.display_name ?? ""} onBlur={(e) => save({ display_name: e.target.value })} />
        </label>
        <label className="block text-sm"><span className="text-ink-2">Day 1 of your programme (a Monday)</span>
          <input type="date" className="input mt-1" value={profile.start_date} onChange={(e) => save({ start_date: e.target.value })} />
          {!isMonday ? <span className="mt-1 block text-warn">Weeks run Monday to Sunday, so a Monday works best.</span> : null}
        </label>
        <label className="block text-sm"><span className="text-ink-2">Time zone (your day and streak reset at local midnight)</span>
          <select className="input mt-1" value={profile.timezone} onChange={(e) => save({ timezone: e.target.value })}>
            {[...new Set([profile.timezone, ...ZONES])].map((z) => <option key={z}>{z}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={profile.tutor_enabled} onChange={(e) => save({ tutor_enabled: e.target.checked })} /> Show the AI tutor in lessons
        </label>
        {msg ? <p className="text-sm text-ink-3">{msg}</p> : null}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Calendar reminders</h2>
        <p className="mt-1 text-sm text-ink-2">Add this private link to Google Calendar (Other calendars, then From URL). Each study day appears with its lesson title, and Sundays show the coming week&apos;s papers. Google refreshes it every few hours.</p>
        {feed ? (
          <div className="mt-3 flex gap-2">
            <input className="input font-mono text-xs" readOnly value={feed} onFocus={(e) => e.currentTarget.select()} />
            <button className="btn" onClick={() => { navigator.clipboard.writeText(feed); setCopied(true); }}>{copied ? "Copied" : "Copy"}</button>
          </div>
        ) : <p className="mt-2 text-sm text-ink-3">Your calendar link appears after your profile is created.</p>}
        <p className="mt-2 text-xs text-ink-3">Keep this link private: anyone with it can see your study schedule (nothing else).</p>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-1 text-sm text-ink-2">Signed in as {user.email}.</p>
        <form action="/auth/signout" method="post" className="mt-3"><button className="btn">Sign out</button></form>
      </section>
    </div>
  );
}
