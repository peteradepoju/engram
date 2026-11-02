"use client";

import { useState } from "react";
import { useProfile } from "@/lib/hooks/use-user";
import { RichText } from "./rich-text";

type Msg = { role: "user" | "assistant"; content: string };

/** The AI tutor: ask about anything on the page. It explains, gives hints and checks reasoning. */
export function Tutor({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const { user, profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const sel = typeof window !== "undefined" ? window.getSelection()?.toString().slice(0, 1500) : "";
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, lessonTitle, selection: sel, messages: next.slice(-10) }),
      });
      const data = await res.json();
      setMsgs([...next, { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "I couldn't reach the tutor. Check your connection and try again." }]);
    }
    setBusy(false);
  }

  if (profile && !profile.tutor_enabled) return null;
  return (
    <>
      <button onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg md:bottom-6"
        aria-expanded={open}>
        {open ? "Close tutor" : "Ask the tutor"}
      </button>
      {open ? (
        <div className="fixed bottom-36 right-4 z-40 flex max-h-[70dvh] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl md:bottom-20">
          <div className="border-b border-line px-4 py-3">
            <div className="font-semibold">Tutor</div>
            <div className="text-xs text-ink-3">Ask about this lesson. Select text on the page first to ask about it. It gives hints before answers on exercises.</div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-[0.93rem]">
            {msgs.length === 0 ? <p className="text-ink-3">Try: &ldquo;Explain step 3 of the derivation another way&rdquo; or &ldquo;Why does the perceptron need a bias?&rdquo;</p> : null}
            {msgs.map((m, i) => (
              m.role === "user"
                ? <div key={i} className="ml-8 whitespace-pre-wrap rounded-xl bg-accent-soft px-3 py-2">{m.content}</div>
                : <div key={i} className="mr-2 leading-relaxed"><RichText text={m.content} /></div>
            ))}
            {busy ? <div className="text-ink-3">Thinking…</div> : null}
          </div>
          {user ? (
            <div className="flex gap-2 border-t border-line p-3">
              <textarea className="input !py-2" rows={2} value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Ask a question" />
              <button className="btn btn-primary" onClick={send} disabled={busy || !text.trim()}>Send</button>
            </div>
          ) : (
            <div className="border-t border-line p-3 text-sm"><a href="/login" className="font-semibold text-accent underline">Sign in</a> to use the tutor.</div>
          )}
        </div>
      ) : null}
    </>
  );
}
