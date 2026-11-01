"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { STAGES, VENUES } from "../../lab-nav";

type Fields = Record<string, string>;
type Project = {
  id: string; title: string; stage: string; hypothesis: Fields; plan: Fields; outline: Fields; results: string;
  venue: string | null; deadline: string | null; submission_status: string | null; is_public: boolean;
};
type Draft = { id: string; title: string; url: string | null; notes: string; created_at: string };

const SECTIONS: { key: "hypothesis" | "plan" | "outline"; title: string; fields: [string, string][] }[] = [
  { key: "hypothesis", title: "Hypothesis", fields: [
    ["question", "The research question, as precisely as you can"],
    ["level", "Marr level (computational, algorithmic, implementational)"],
    ["claim", "Hypothesis: a falsifiable claim"],
    ["prediction", "If it is true, what will you observe?"],
    ["refute", "What result would show it is wrong?"],
    ["prior", "What is already known (key papers)?"],
  ] },
  { key: "plan", title: "Experiment plan", fields: [
    ["data", "Data or model: what will you use?"],
    ["method", "Method: the analysis or simulation, step by step"],
    ["baselines", "Baselines and controls"],
    ["stats", "Statistics: how will you decide the result is real?"],
    ["compute", "Compute and tools"],
    ["timeline", "Timeline and milestones"],
    ["risks", "Risks and fallback plan"],
  ] },
  { key: "outline", title: "Paper outline", fields: [
    ["title", "Working title"],
    ["abstract", "Abstract (150 to 250 words)"],
    ["figures", "Figure list: one line per figure, each with its message"],
    ["related", "Related work and how yours differs"],
    ["contribution", "Main contributions (2 to 4 bullets)"],
  ] },
];

export function ProjectEditor({ id }: { id: string }) {
  const { user } = useUser();
  const router = useRouter();
  const [p, setP] = useState<Project | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saved, setSaved] = useState("");
  const [draft, setDraft] = useState({ title: "", url: "" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    const sb = supabase();
    sb.from("projects").select("*").eq("id", id).maybeSingle().then(({ data }) => setP(data as Project));
    sb.from("drafts").select("*").eq("project_id", id).order("created_at", { ascending: false }).then(({ data }) => setDrafts((data ?? []) as Draft[]));
  }, [user, id]);

  function change(patch: Partial<Project>) {
    if (!p) return;
    const next = { ...p, ...patch };
    setP(next);
    setSaved("Saving…");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const { id: _id, ...rest } = next;
      await supabase().from("projects").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
      setSaved("Saved");
    }, 700);
  }

  async function addDraft() {
    if (!user || !draft.title.trim()) return;
    await supabase().from("drafts").insert({ project_id: id, user_id: user.id, title: draft.title.trim(), url: draft.url.trim() || null });
    setDraft({ title: "", url: "" });
    const { data } = await supabase().from("drafts").select("*").eq("project_id", id).order("created_at", { ascending: false });
    setDrafts((data ?? []) as Draft[]);
  }

  async function remove() {
    if (!confirm("Delete this project and its drafts? This cannot be undone.")) return;
    await supabase().from("projects").delete().eq("id", id);
    router.push("/lab/projects");
  }

  if (!user) return null;
  if (!p) return <div className="mx-auto max-w-3xl px-4 pt-10 text-ink-3">Loading project…</div>;
  const idx = STAGES.findIndex((s) => s.id === p.stage);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <nav className="flex justify-between text-sm text-ink-3"><Link href="/lab/projects" className="hover:text-ink">← Projects</Link><span>{saved}</span></nav>
      <input className="mt-4 w-full bg-transparent text-2xl font-semibold outline-none" style={{ fontFamily: "var(--font-serif)" }} value={p.title} onChange={(e) => change({ title: e.target.value })} aria-label="Project title" />

      <section className="card mt-4 p-4">
        <div className="eyebrow">Stage</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {STAGES.map((s, i) => (
            <button key={s.id} onClick={() => change({ stage: s.id })} className={`chip !py-1.5 ${i === idx ? "!bg-accent !text-white" : i < idx ? "!bg-accent-soft !text-accent" : ""}`}>{i + 1}. {s.label}</button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-2">{STAGES[idx]?.hint}</p>
      </section>

      {SECTIONS.map((sec) => (
        <section key={sec.key} className="mt-6">
          <h2 className="text-xl font-semibold">{sec.title}</h2>
          <div className="mt-2 space-y-3">
            {sec.fields.map(([k, label]) => (
              <label key={k} className="block text-sm">
                <span className="text-ink-2">{label}</span>
                <textarea className="input mt-1" rows={k === "abstract" || k === "method" || k === "figures" ? 5 : 2} value={p[sec.key]?.[k] ?? ""}
                  onChange={(e) => change({ [sec.key]: { ...(p[sec.key] ?? {}), [k]: e.target.value } } as Partial<Project>)} />
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Results log</h2>
        <textarea className="input mt-2" rows={6} value={p.results} placeholder="Dated notes: what you ran, what came out, what it means." onChange={(e) => change({ results: e.target.value })} />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Venue and submission</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <label className="text-sm"><span className="text-ink-2">Target venue</span>
            <select className="input mt-1" value={p.venue ?? ""} onChange={(e) => change({ venue: e.target.value || null })}>
              <option value="">Not chosen</option>{VENUES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="text-sm"><span className="text-ink-2">Deadline</span>
            <input type="date" className="input mt-1" value={p.deadline ?? ""} onChange={(e) => change({ deadline: e.target.value || null })} />
          </label>
          <label className="text-sm"><span className="text-ink-2">Status</span>
            <input className="input mt-1" value={p.submission_status ?? ""} placeholder="e.g. under review" onChange={(e) => change({ submission_status: e.target.value })} />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.is_public} onChange={(e) => change({ is_public: e.target.checked })} /> Show this project on my public portfolio
        </label>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Drafts</h2>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Draft name, e.g. v1 for lab meeting" />
          <input className="input" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="Link (Overleaf, Google Docs, PDF)" />
          <button className="btn btn-primary" onClick={addDraft} disabled={!draft.title.trim()}>Add</button>
        </div>
        <ul className="mt-3 space-y-2">
          {drafts.map((d) => (
            <li key={d.id} className="card flex justify-between gap-2 p-3 text-sm">
              <span>{d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="text-accent underline">{d.title}</a> : d.title}</span>
              <span className="text-ink-3">{new Date(d.created_at).toLocaleDateString("en-GB")}</span>
            </li>
          ))}
        </ul>
      </section>

      <button className="btn mt-10 !text-bad" onClick={remove}>Delete project</button>
    </div>
  );
}
