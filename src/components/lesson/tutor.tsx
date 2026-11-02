"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("engram:tutor", toggle);
    return () => window.removeEventListener("engram:tutor", toggle);
  }, []);

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
        className="fixed bottom-6 right-4 z-40 hidden rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg md:block"
        aria-expanded={open}>
        {open ? "Close tutor" : "Ask the tutor"}
      </button>
      {open ? <button className="sheet-backdrop fixed inset-0 z-40 bg-black/45 md:hidden" onClick={() => setOpen(false)} aria-label="Close tutor" /> : null}
      {open ? (
        <div className="sheet fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-3xl border border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl md:inset-x-auto md:bottom-20 md:right-4 md:max-h-[70dvh] md:w-[26rem] md:rounded-2xl md:pb-0">
          <div className="border-b border-line px-4 py-3">
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-line md:hidden" />
            <div className="flex items-center justify-between"><div className="font-semibold">Tutor</div><button onClick={() => setOpen(false)} className="tap -mr-1 rounded-full px-2 py-1 text-sm text-ink-3 md:hidden">Close</button></div>
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
              <textarea className="input !py-2 text-base md:text-[0.95rem]" rows={2} value={text} onChange={(e) => setText(e.target.value)}
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
