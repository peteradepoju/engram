"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { STAGES } from "../lab-nav";

type P = { id: string; title: string; stage: string; venue: string | null; deadline: string | null; updated_at: string; is_public: boolean };

export function ProjectList() {
  const { user } = useUser();
  const router = useRouter();
  const [ps, setPs] = useState<P[]>([]);
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (!user) return;
    supabase().from("projects").select("id, title, stage, venue, deadline, updated_at, is_public").eq("user_id", user.id).order("updated_at", { ascending: false })
      .then(({ data }) => setPs((data ?? []) as P[]));
  }, [user]);

  async function create() {
    if (!user || !title.trim()) return;
    const { data } = await supabase().from("projects").insert({ user_id: user.id, title: title.trim() }).select("id").single();
    if (data) router.push(`/lab/projects/${data.id}`);
  }

  if (!user) return null;
  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-2">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New project: a working title or question" />
        <button className="btn btn-primary" onClick={create} disabled={!title.trim()}>Create</button>
      </div>
      <ul className="space-y-2">
        {ps.map((p) => {
          const idx = STAGES.findIndex((s) => s.id === p.stage);
          return (
            <li key={p.id}>
              <Link href={`/lab/projects/${p.id}`} className="card block p-4 hover:border-ink-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex-1 font-semibold">{p.title}</span>
                  {p.venue ? <span className="chip">{p.venue}</span> : null}
                  {p.deadline ? <span className="chip !bg-warn-soft !text-warn">Due {new Date(p.deadline + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span> : null}
                  {p.is_public ? <span className="chip !bg-good-soft !text-good">Public</span> : null}
                </div>
                <div className="mt-3 flex gap-1">{STAGES.map((s, i) => <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-accent" : "bg-surface-2"}`} title={s.label} />)}</div>
                <div className="mt-1 text-xs text-ink-3">{STAGES[idx]?.label}</div>
              </Link>
            </li>
          );
        })}
        {!ps.length ? <li className="text-sm text-ink-3">No projects yet. Promote a question from the question bank or create one above.</li> : null}
      </ul>
    </div>
  );
}
