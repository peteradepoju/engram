"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";

type Q = { id: string; text: string; tags: string[]; status: string; created_at: string };
const LEVELS = ["computational", "algorithmic", "implementational"];

export function QuestionBank() {
  const { user } = useUser();
  const router = useRouter();
  const [qs, setQs] = useState<Q[]>([]);
  const [text, setText] = useState("");
  const [show, setShow] = useState("open");

  async function load(uid: string) {
    const { data } = await supabase().from("questions").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    setQs((data ?? []) as Q[]);
  }
  useEffect(() => { if (user) void load(user.id); }, [user]);

  async function add() {
    if (!user || !text.trim()) return;
    await supabase().from("questions").insert({ user_id: user.id, text: text.trim() });
    setText(""); void load(user.id);
  }
  async function update(id: string, patch: Partial<Q>) {
    if (!user) return;
    await supabase().from("questions").update(patch).eq("id", id);
    void load(user.id);
  }
  async function promote(q: Q) {
    if (!user) return;
    const { data } = await supabase().from("projects").insert({ user_id: user.id, question_id: q.id, title: q.text.slice(0, 140), stage: "question" }).select("id").single();
    await supabase().from("questions").update({ status: "promoted" }).eq("id", q.id);
    if (data) router.push(`/lab/projects/${data.id}`);
  }
  function toggleTag(q: Q, tag: string) {
    const tags = q.tags.includes(tag) ? q.tags.filter((t) => t !== tag) : [...q.tags.filter((t) => !LEVELS.includes(t) || !LEVELS.includes(tag)), tag];
    void update(q.id, { tags });
  }

  if (!user) return null;
  const shown = qs.filter((q) => show === "all" || q.status === show);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a question" onKeyDown={(e) => { if (e.key === "Enter") void add(); }} />
        <button className="btn btn-primary" onClick={add} disabled={!text.trim()}>Add</button>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {["open", "promoted", "parked", "answered", "all"].map((s) => (
          <button key={s} className={`chip !py-1 ${show === s ? "!bg-accent !text-white" : ""}`} onClick={() => setShow(s)}>
            {s[0].toUpperCase() + s.slice(1)} ({s === "all" ? qs.length : qs.filter((q) => q.status === s).length})
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {shown.map((q) => (
          <li key={q.id} className="card p-4">
            <p className="font-medium">{q.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-ink-3">Marr level:</span>
              {LEVELS.map((l) => (
                <button key={l} className={`chip ${q.tags.includes(l) ? "!bg-accent-soft !text-accent" : ""}`} onClick={() => toggleTag(q, l)}>{l}</button>
              ))}
              {q.tags.filter((t) => !LEVELS.includes(t)).map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.status !== "promoted" ? <button className="btn btn-primary !py-1" onClick={() => promote(q)}>Make it a project</button> : null}
              {q.status === "open" ? <button className="btn !py-1" onClick={() => update(q.id, { status: "parked" })}>Park</button> : null}
              {q.status === "parked" ? <button className="btn !py-1" onClick={() => update(q.id, { status: "open" })}>Reopen</button> : null}
              {q.status !== "answered" ? <button className="btn !py-1" onClick={() => update(q.id, { status: "answered" })}>Answered</button> : null}
            </div>
          </li>
        ))}
        {!shown.length ? <li className="text-sm text-ink-3">Nothing here yet.</li> : null}
      </ul>
    </div>
  );
}
