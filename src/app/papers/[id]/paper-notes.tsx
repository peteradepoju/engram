"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { recordStudy } from "@/lib/progress";

const STATUS = [["unread", "Not started"], ["skimmed", "First pass"], ["read", "Second pass"], ["deep", "Deep read"]] as const;
const CRIT = [["claim", "Claim: the main claim in one sentence"], ["evidence", "Evidence: what supports it"], ["method", "Method: how it was done, what is left out"], ["weakness", "Weakness: where it is weakest"], ["next", "Next: what you would do next"]] as const;

type Critique = Partial<Record<(typeof CRIT)[number][0], string>>;

/** The learner's own notes, reading status and critique for a paper. Saves as they type. */
export function PaperNotes({ paperId, source }: { paperId: string; source: string }) {
  const { user, loading } = useUser();
  const [status, setStatus] = useState("unread");
  const [notes, setNotes] = useState("");
  const [crit, setCrit] = useState<Critique>({});
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [idea, setIdea] = useState("");
  const [ideaSent, setIdeaSent] = useState(false);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase().from("paper_notes").select("*").eq("user_id", user.id).eq("paper_id", paperId).maybeSingle().then(({ data }) => {
      if (data) { setStatus(data.status); setNotes(data.notes); setCrit(data.critique ?? {}); }
      loaded.current = true;
    });
  }, [user, paperId]);

  function save(next: { status?: string; notes?: string; crit?: Critique }) {
    if (!user || !loaded.current) return;
    setSaved("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await supabase().from("paper_notes").upsert({
        user_id: user.id, paper_id: paperId, status: next.status ?? status, notes: next.notes ?? notes, critique: next.crit ?? crit, updated_at: new Date().toISOString(),
      });
      setSaved("saved");
    }, 700);
  }

  async function sendIdea() {
    if (!user || !idea.trim()) return;
    await supabase().from("questions").insert({ user_id: user.id, text: idea.trim(), tags: [`paper:${paperId}`] });
    await recordStudy(5);
    setIdeaSent(true);
  }

  if (loading) return null;
  if (!user) {
    return <section className="card mt-8 p-5 text-sm"><Link href="/login" className="font-semibold text-accent underline">Sign in</Link> to keep notes, track your reading and write critiques.</section>;
  }

  return (
    <section className="mt-8 space-y-5">
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">My notes</h2><span className="text-xs text-ink-3">{saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : ""}</span></div>
      <div className="flex flex-wrap gap-2">
        {STATUS.map(([v, l]) => (
          <button key={v} className={`chip !py-1.5 ${status === v ? "!bg-accent !text-white" : ""}`}
            onClick={() => { setStatus(v); save({ status: v }); if (v !== "unread") void recordStudy(30); }}>{l}</button>
        ))}
      </div>
      <textarea className="input" rows={6} value={notes} placeholder="Five Cs, answers to the questions, anything you noticed." onChange={(e) => { setNotes(e.target.value); save({ notes: e.target.value }); }} />
      <div>
        <h3 className="font-semibold">My critique</h3>
        <div className="mt-2 space-y-2">
          {CRIT.map(([k, l]) => (
            <label key={k} className="block text-sm">
              <span className="text-ink-2">{l}</span>
              <textarea className="input mt-1" rows={2} value={crit[k] ?? ""} onChange={(e) => { const c = { ...crit, [k]: e.target.value }; setCrit(c); save({ crit: c }); }} />
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-good/40 bg-good-soft p-4">
        <div className="font-semibold">Did this paper give you a research question?</div>
        {ideaSent ? <p className="mt-2 text-sm">Added to your <Link className="text-accent underline" href="/lab/questions">question bank</Link>.</p> : (
          <div className="mt-2 flex gap-2">
            <input className="input !bg-surface" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Write it as a question" />
            <button className="btn btn-primary" onClick={sendIdea} disabled={!idea.trim()}>Add</button>
          </div>
        )}
      </div>
      <input type="hidden" value={source} />
    </section>
  );
}
