"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { recordStudy } from "@/lib/progress";

type Entry = { id: string; source: string | null; body: string; created_at: string };

export function JournalList() {
  const { user } = useUser();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [body, setBody] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");

  async function load(uid: string) {
    const { data } = await supabase().from("journal_entries").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(500);
    setEntries((data ?? []) as Entry[]);
  }
  useEffect(() => { if (user) void load(user.id); }, [user]);

  async function add() {
    if (!user || !body.trim()) return;
    const sb = supabase();
    const { data } = await sb.from("journal_entries").insert({ user_id: user.id, source: "free", body: body.trim() }).select("id").single();
    if (q.trim() && data) await sb.from("questions").insert({ user_id: user.id, journal_id: data.id, text: q.trim() });
    await recordStudy(15);
    setBody(""); setQ("");
    void load(user.id);
  }

  async function remove(id: string) {
    if (!user || !confirm("Delete this entry?")) return;
    await supabase().from("journal_entries").delete().eq("id", id);
    void load(user.id);
  }

  if (!user) return null;
  const shown = entries.filter((e) => !filter || e.body.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="mt-6 space-y-6">
      <section className="card p-4">
        <div className="font-semibold">New entry</div>
        <textarea className="input mt-2" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you read or do? What surprised or bothered you?" />
        <input className="input mt-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Optional: a research question (goes to the question bank)" />
        <button className="btn btn-primary mt-3" onClick={add} disabled={!body.trim()}>Save entry</button>
      </section>
      <input className="input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`Search ${entries.length} entries`} />
      <ul className="space-y-3">
        {shown.map((e) => (
          <li key={e.id} className="card p-4">
            <div className="flex justify-between text-xs text-ink-3">
              <span>{new Date(e.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}{e.source && e.source !== "free" ? ` · ${e.source}` : ""}</span>
              <button className="hover:text-bad" onClick={() => remove(e.id)}>Delete</button>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{e.body}</p>
          </li>
        ))}
        {!shown.length ? <li className="text-sm text-ink-3">No entries yet. Every lesson ends with a journal prompt.</li> : null}
      </ul>
    </div>
  );
}
