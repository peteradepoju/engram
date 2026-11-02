"use client";

import { useState } from "react";

const ROWS = [
  { trial: 1, contrast: 0, side: "left", correct: 0, rt: 0.92 },
  { trial: 2, contrast: 0.25, side: "right", correct: 1, rt: 0.61 },
  { trial: 3, contrast: 1, side: "left", correct: 1, rt: 0.38 },
  { trial: 4, contrast: 0.25, side: "left", correct: 0, rt: 0.74 },
  { trial: 5, contrast: 1, side: "right", correct: 1, rt: 0.41 },
  { trial: 6, contrast: 0, side: "right", correct: 1, rt: 0.88 },
  { trial: 7, contrast: 0.25, side: "right", correct: 1, rt: 0.55 },
  { trial: 8, contrast: 1, side: "left", correct: 1, rt: 0.35 },
];
const COLOURS = ["var(--neuro)", "var(--ai)", "var(--accent)", "var(--good)"];
type By = "contrast" | "side";
type Agg = "correct" | "rt";

/** groupby in three steps: split the rows by a column, apply a summary to each group, combine the results. */
export function SplitApplyCombine() {
  const [by, setBy] = useState<By>("contrast");
  const [agg, setAgg] = useState<Agg>("correct");
  const keys = [...new Set(ROWS.map((r) => String(r[by])))];
  const colour = (k: string) => COLOURS[keys.indexOf(k) % COLOURS.length];
  const groups = keys.map((k) => {
    const rows = ROWS.filter((r) => String(r[by]) === k);
    return { k, rows, value: rows.reduce((a, r) => a + r[agg], 0) / rows.length };
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-2">df.groupby(</span>
        {(["contrast", "side"] as By[]).map((b) => <button key={b} className={`chip !py-1 ${by === b ? "!bg-accent !text-white" : ""}`} onClick={() => setBy(b)}>&quot;{b}&quot;</button>)}
        <span className="text-ink-2">)[</span>
        {(["correct", "rt"] as Agg[]).map((a) => <button key={a} className={`chip !py-1 ${agg === a ? "!bg-accent !text-white" : ""}`} onClick={() => setAgg(a)}>&quot;{a}&quot;</button>)}
        <span className="text-ink-2">].mean()</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <div className="eyebrow mb-1">1. The table</div>
          <table className="w-full text-xs">
            <thead><tr className="text-ink-3"><th className="text-left">trial</th><th>contrast</th><th>side</th><th>correct</th><th>rt (s)</th></tr></thead>
            <tbody>{ROWS.map((r) => (
              <tr key={r.trial} style={{ borderLeft: `4px solid ${colour(String(r[by]))}` }}>
                <td className="pl-1">{r.trial}</td><td className="text-center">{r.contrast}</td><td className="text-center">{r.side}</td><td className="text-center">{r.correct}</td><td className="text-center">{r.rt}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div>
          <div className="eyebrow mb-1">2. Split and apply</div>
          <div className="space-y-2">{groups.map((g) => (
            <div key={g.k} className="rounded-lg p-2 text-xs" style={{ border: `1.5px solid ${colour(g.k)}` }}>
              <div className="font-semibold">{by} = {g.k}</div>
              <div className="font-mono text-ink-2">mean of [{g.rows.map((r) => r[agg]).join(", ")}]</div>
            </div>
          ))}</div>
        </div>
        <div>
          <div className="eyebrow mb-1">3. Combine</div>
          <table className="w-full text-sm">
            <thead><tr className="text-ink-3"><th className="text-left">{by}</th><th className="text-right">{agg}</th></tr></thead>
            <tbody>{groups.map((g) => (
              <tr key={g.k}><td style={{ color: colour(g.k) }} className="font-semibold">{g.k}</td><td className="text-right font-mono">{g.value.toFixed(2)}</td></tr>
            ))}</tbody>
          </table>
          <p className="mt-2 text-xs text-ink-3">{agg === "correct" ? "The mean of a 0/1 column is the proportion correct." : "Reaction times usually shrink as the stimulus gets easier."}</p>
        </div>
      </div>
    </div>
  );
}
