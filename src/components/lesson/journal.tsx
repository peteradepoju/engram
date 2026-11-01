"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { recordStudy } from "@/lib/progress";
import { useUser } from "@/lib/hooks/use-user";
import { useLesson } from "./context";

/** A research-journal prompt. Entries go to the Lab, where questions can become projects. */
export function JournalPrompt({ prompt }: { prompt: string }) {
  const { lessonId } = useLesson();
  const { user } = useUser();
  const [body, setBody] = useState("");
  const [question, setQuestion] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!user || !body.trim()) return;
    setBusy(true);
    const sb = supabase();
    const { data } = await sb.from("journal_entries").insert({ user_id: user.id, source: lessonId, body: body.trim() }).select("id").single();
    if (question.trim() && data) {
      await sb.from("questions").insert({ user_id: user.id, journal_id: data.id, text: question.trim() });
    }
    await recordStudy(15);
    setBusy(false);
    setSaved(true);
  }

  return (
    <section className="rounded-xl border border-good/40 bg-good-soft p-5 not-prose">
      <div className="eyebrow !text-good">Research journal · 15 minutes</div>
      <p className="mt-2 font-medium">{prompt}</p>
      {saved ? (
        <p className="mt-3 text-sm">Saved to your <a className="font-semibold text-accent underline" href="/lab/journal">journal</a>{question.trim() ? " and your question bank" : ""}.</p>
      ) : user ? (
        <>
          <textarea className="input mt-3 !bg-surface" rows={4} value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="What surprised you? What do you not quite believe? What has nobody tested?" />
          <input className="input mt-2 !bg-surface" value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Optional: one research question this raises (goes to your question bank)" />
          <button className="btn btn-primary mt-3" disabled={busy || !body.trim()} onClick={save}>{busy ? "Saving…" : "Save entry"}</button>
        </>
      ) : (
        <p className="mt-3 text-sm"><a className="font-semibold text-accent underline" href="/login">Sign in</a> to keep a research journal.</p>
      )}
    </section>
  );
}
