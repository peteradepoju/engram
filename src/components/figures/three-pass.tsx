"use client";

import { useState } from "react";

const PASSES = [
  { name: "First pass", time: "5 to 10 minutes", read: ["title", "abstract", "intro", "headings", "figures", "conclusion"],
    goal: "Decide what kind of paper it is, what it claims and whether to read on. Answer the five Cs: category, context, correctness, contributions, clarity." },
  { name: "Second pass", time: "about 1 hour", read: ["title", "abstract", "intro", "headings", "figures", "methods-skim", "results", "conclusion", "refs"],
    goal: "Read properly but skip proofs and fine detail. Study every figure: axes, error bars, what each panel shows. Mark references to read later. Summarise the main argument to someone else." },
  { name: "Third pass", time: "several hours", read: ["title", "abstract", "intro", "headings", "figures", "methods", "methods-skim", "results", "conclusion", "refs"],
    goal: "Re-create the work in your head (or in code). Challenge every assumption. Note what you would do differently. This is the pass that produces research ideas." },
];

const BLOCKS: { id: string; label: string; h: number }[] = [
  { id: "title", label: "Title and authors", h: 26 }, { id: "abstract", label: "Abstract", h: 40 }, { id: "intro", label: "Introduction", h: 52 },
  { id: "headings", label: "Section headings", h: 18 }, { id: "figures", label: "Figures and captions", h: 60 }, { id: "methods-skim", label: "Methods (skim)", h: 24 },
  { id: "methods", label: "Methods (in full, with maths)", h: 56 }, { id: "results", label: "Results", h: 52 }, { id: "conclusion", label: "Discussion and conclusion", h: 34 }, { id: "refs", label: "References", h: 22 },
];

/** Keshav's three-pass method: which parts of a paper to read on each pass. */
export function ThreePass() {
  const [p, setP] = useState(0);
  const pass = PASSES[p];
  let y = 10;
  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <svg viewBox="0 0 220 420" className="w-full max-w-[220px] justify-self-center" role="img" aria-label={`Parts of a paper read in the ${pass.name.toLowerCase()}`}>
        <rect x="5" y="5" width="210" height="410" rx="10" fill="var(--surface-2)" />
        {BLOCKS.map((b) => {
          const on = pass.read.includes(b.id);
          const el = (
            <g key={b.id}>
              <rect x="15" y={y} width="190" height={b.h} rx="5" fill={on ? "var(--accent)" : "var(--surface)"} opacity={on ? 0.85 : 1} stroke="var(--line)" />
              <text x="110" y={y + b.h / 2 + 4} textAnchor="middle" fontSize="11" fill={on ? "#fff" : "var(--ink-3)"}>{b.label}</text>
            </g>
          );
          y += b.h + 4;
          return el;
        })}
      </svg>
      <div>
        <div className="flex flex-wrap gap-2">
          {PASSES.map((x, i) => (
            <button key={x.name} onClick={() => setP(i)} className={`btn !py-1.5 ${i === p ? "btn-primary" : ""}`}>{x.name}</button>
          ))}
        </div>
        <div className="mt-4 text-sm text-ink-3">{pass.time}</div>
        <p className="mt-1 text-[0.98rem]">{pass.goal}</p>
        <p className="mt-3 text-sm text-ink-2">Method from S. Keshav, &ldquo;How to Read a Paper&rdquo;, ACM SIGCOMM Computer Communication Review, 2007.</p>
      </div>
    </div>
  );
}
