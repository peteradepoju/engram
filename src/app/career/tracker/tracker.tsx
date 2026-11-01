"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";

type App = { id: string; programme: string; institution: string | null; country: string | null; deadline: string | null; status: string; url: string | null; notes: string };
const STATUSES = ["researching", "contacted", "preparing", "submitted", "interview", "offer", "declined", "rejected"];

export function Tracker() {
  const { user } = useUser();
  const [apps, setApps] = useState<App[]>([]);
  const [form, setForm] = useState({ programme: "", institution: "", country: "", deadline: "", url: "" });

  async function load(uid: string) {
    const { data } = await supabase().from("applications").select("*").eq("user_id", uid).order("deadline", { ascending: true, nullsFirst: false });
    setApps((data ?? []) as App[]);
  }
  useEffect(() => { if (user) void load(user.id); }, [user]);

  async function add() {
    if (!user || !form.programme.trim()) return;
    await supabase().from("applications").insert({ user_id: user.id, programme: form.programme.trim(), institution: form.institution || null, country: form.country || null, deadline: form.deadline || null, url: form.url || null });
    setForm({ programme: "", institution: "", country: "", deadline: "", url: "" });
    void load(user.id);
  }
  async function patch(id: string, p: Partial<App>) {
    if (!user) return;
    setApps((a) => a.map((x) => (x.id === id ? { ...x, ...p } : x)));
    await supabase().from("applications").update(p).eq("id", id);
  }
  async function remove(id: string) {
    if (!user || !confirm("Remove this entry?")) return;
    await supabase().from("applications").delete().eq("id", id);
    void load(user.id);
  }

  if (!user) return null;
  return (
    <div className="mt-6 space-y-4">
      <section className="card grid gap-2 p-4 sm:grid-cols-6">
        <input className="input sm:col-span-2" placeholder="Programme or supervisor" value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })} />
        <input className="input" placeholder="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
        <input className="input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} aria-label="Deadline" />
        <button className="btn btn-primary justify-center" onClick={add} disabled={!form.programme.trim()}>Add</button>
        <input className="input sm:col-span-6" placeholder="Link to the programme page" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </section>
      <ul className="space-y-2">
        {apps.map((a) => (
          <li key={a.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex-1 font-semibold">{a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="hover:underline">{a.programme}</a> : a.programme}</span>
              <span className="text-sm text-ink-3">{[a.institution, a.country].filter(Boolean).join(", ")}</span>
              {a.deadline ? <span className="chip !bg-warn-soft !text-warn">{new Date(a.deadline + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span> : null}
              <select className="input !w-auto !py-1" value={a.status} onChange={(e) => patch(a.id, { status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              <button className="text-sm text-ink-3 hover:text-bad" onClick={() => remove(a.id)}>Remove</button>
            </div>
            <textarea className="input mt-2" rows={2} placeholder="Notes: supervisors, requirements, references, replies" value={a.notes} onChange={(e) => patch(a.id, { notes: e.target.value })} />
          </li>
        ))}
        {!apps.length ? <li className="text-sm text-ink-3">Nothing tracked yet. Start your shortlist in Week 140, or now if you like.</li> : null}
      </ul>
    </div>
  );
}
