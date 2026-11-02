"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { STAGES } from "./lab-nav";

type Project = { id: string; title: string; stage: string; venue: string | null; deadline: string | null; updated_at: string };

export function LabOverview() {
  const { user } = useUser();
  const [counts, setCounts] = useState({ journal: 0, questions: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [recent, setRecent] = useState<{ id: string; text: string; status: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    const sb = supabase();
    Promise.all([
      sb.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      sb.from("questions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      sb.from("projects").select("id, title, stage, venue, deadline, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }),
      sb.from("questions").select("id, text, status").eq("user_id", user.id).eq("status", "open").order("created_at", { ascending: false }).limit(5),
    ]).then(([j, q, p, r]) => {
      setCounts({ journal: j.count ?? 0, questions: q.count ?? 0 });
      setProjects((p.data ?? []) as Project[]);
      setRecent((r.data ?? []) as typeof recent);
    });
  }, [user]);

  if (!user) return null;
  const byStage = (s: string) => projects.filter((p) => p.stage === s).length;

  return (
    <div className="mt-6 space-y-6">
      <section className="grid gap-2 sm:grid-cols-4">
        <Link href="/lab/journal" className="card p-4 hover:border-ink-3"><div className="text-xs text-ink-3">Journal entries</div><div className="text-2xl font-semibold">{counts.journal}</div></Link>
        <Link href="/lab/questions" className="card p-4 hover:border-ink-3"><div className="text-xs text-ink-3">Questions</div><div className="text-2xl font-semibold">{counts.questions}</div></Link>
        <Link href="/lab/projects" className="card p-4 hover:border-ink-3"><div className="text-xs text-ink-3">Projects</div><div className="text-2xl font-semibold">{projects.length}</div></Link>
        <div className="card p-4"><div className="text-xs text-ink-3">Submitted or published</div><div className="text-2xl font-semibold">{byStage("submitted") + byStage("published")}</div></div>
      </section>

      <section className="card overflow-x-auto p-4">
        <div className="eyebrow">Pipeline</div>
        <ol className="mt-3 flex min-w-[640px] items-stretch gap-1">
          {STAGES.map((s, i) => (
            <li key={s.id} className="flex-1">
              <div className={`flex h-full flex-col items-center justify-between gap-1 rounded-lg px-2 py-2 text-center ${byStage(s.id) ? "bg-accent-soft" : "bg-surface-2"}`}>
                <div className="flex min-h-[2.2rem] items-center text-xs font-semibold leading-tight">{i + 1}. {s.label}</div>
                <div className="text-lg font-semibold">{byStage(s.id)}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-4">
          <div className="flex items-center justify-between"><div className="font-semibold">Open questions</div><Link href="/lab/questions" className="text-sm text-accent underline">All</Link></div>
          {recent.length ? <ul className="mt-2 space-y-2 text-[0.95rem]">{recent.map((q) => <li key={q.id} className="border-l-2 border-accent pl-3">{q.text}</li>)}</ul>
            : <p className="mt-2 text-sm text-ink-3">No questions yet. They come from lesson journal prompts and paper pages.</p>}
        </section>
        <section className="card p-4">
          <div className="flex items-center justify-between"><div className="font-semibold">Projects</div><Link href="/lab/projects" className="text-sm text-accent underline">All</Link></div>
          {projects.length ? (
            <ul className="mt-2 space-y-2">{projects.slice(0, 5).map((p) => (
              <li key={p.id}><Link href={`/lab/projects/${p.id}`} className="flex justify-between gap-2 hover:underline"><span className="truncate">{p.title}</span><span className="chip shrink-0">{STAGES.find((s) => s.id === p.stage)?.label}</span></Link></li>
            ))}</ul>
          ) : <p className="mt-2 text-sm text-ink-3">Promote a question from the question bank to start your first project. The first guided research sprint is in Week 76.</p>}
        </section>
      </div>
    </div>
  );
}
