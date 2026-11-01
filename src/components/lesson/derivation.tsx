"use client";

import { Children, useState, type ReactNode } from "react";
import { Tex } from "./tex";

/** A derivation revealed one line at a time. Each child is one step. */
export function Derivation({ title, children }: { title?: string; children: ReactNode }) {
  const steps = Children.toArray(children).filter((c) => typeof c !== "string" || c.trim() !== "");
  const [shown, setShown] = useState(1);
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center border-b border-line px-5 py-3">
        <div><div className="eyebrow">Derivation</div>{title ? <div className="font-semibold">{title}</div> : null}</div>
        <div className="ml-auto text-sm text-ink-3">Step {Math.min(shown, steps.length)} of {steps.length}</div>
      </div>
      <ol className="!list-none space-y-3 !pl-0 px-5 py-4">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-1 text-sm font-semibold text-accent">{i + 1}</span>
            <div className="min-w-0 flex-1 [&>*+*]:mt-2">{s}</div>
          </li>
        ))}
      </ol>
      <div className="flex gap-2 border-t border-line px-5 py-3">
        <button className="btn btn-primary" disabled={shown >= steps.length} onClick={() => setShown((n) => n + 1)}>Next step</button>
        <button className="btn" disabled={shown >= steps.length} onClick={() => setShown(steps.length)}>Show all</button>
        <button className="btn" disabled={shown <= 1} onClick={() => setShown(1)}>Start again</button>
      </div>
    </section>
  );
}

/** A written exercise (proof or derivation): try on paper, then compare with the worked solution. */
export function Prove({ title = "Derivation exercise", task, children }: { title?: string; task: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [self, setSelf] = useState<string | null>(null);
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line px-5 py-3"><div className="eyebrow">On paper</div><div className="font-semibold">{title}</div></div>
      <div className="px-5 py-4 [&>*+*]:mt-2">{typeof task === "string" ? <p><Tex>{task}</Tex></p> : task}</div>
      <div className="border-t border-line px-5 py-3">
        {!open ? (
          <button className="btn" onClick={() => setOpen(true)}>I have tried it: show the worked solution</button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-surface-2 p-4 [&>*+*]:mt-2">{children}</div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-2">How did you do?</span>
              {["I got it", "Partly", "I was stuck"].map((l) => (
                <button key={l} onClick={() => setSelf(l)} className={`chip !py-1 ${self === l ? "!bg-accent !text-white" : ""}`}>{l}</button>
              ))}
              {self === "I was stuck" ? <span className="text-ink-3">Read the solution, close it, and write it out yourself tomorrow.</span> : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
