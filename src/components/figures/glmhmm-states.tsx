"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Psychometric curves for an engaged and a biased state, and the pooled curve that mixes them. */
export function GLMHMMStates() {
  const [frac, setFrac] = useState(0.6);
  const [bias, setBias] = useState(1.5);
  const cs = Array.from({ length: 81 }, (_, i) => -1 + i * 0.025);
  const sig = (z: number) => 1 / (1 + Math.exp(-z));
  const eng = cs.map((c) => sig(4 * c)), dis = cs.map((c) => sig(0.5 * c + bias));
  const pooled = cs.map((_, i) => frac * eng[i] + (1 - frac) * dis[i]);
  const sx = (c: number) => 35 + ((c + 1) / 2) * 300, sy = (p: number) => 155 - p * 135;
  const lines: [number[], string, string][] = [[eng, "var(--neuro)", "engaged"], [dis, "var(--ai)", "disengaged"], [pooled, "var(--ink)", "pooled"]];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 175" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Psychometric curves by state">
        <line x1="35" x2="335" y1={sy(0.5)} y2={sy(0.5)} stroke="var(--line)" strokeDasharray="3 3" />
        <line x1={sx(0)} x2={sx(0)} y1={sy(0)} y2={sy(1)} stroke="var(--line)" />
        {lines.map(([v, col, nm], k) => <polyline key={nm} points={cs.map((c, i) => `${sx(c)},${sy(v[i])}`).join(" ")} fill="none" stroke={col} strokeWidth={k === 2 ? 2.4 : 1.8} strokeDasharray={k === 2 ? "5 3" : undefined} />)}
        {lines.map(([, col, nm], k) => <text key={nm} x={40 + k * 75} y="14" fontSize="8" fill={col}>{nm}</text>)}
        <text x="335" y="170" fontSize="8" textAnchor="end" fill="var(--ink-3)">signed contrast</text>
      </svg>
      <Slider label="fraction of trials engaged" value={frac} min={0} max={1} step={0.05} onChange={setFrac} fmt={(v) => v.toFixed(2)} />
      <Slider label="bias of the disengaged state" value={bias} min={-3} max={3} step={0.1} onChange={setBias} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="pooled P(right) at contrast −1" value={pooled[0].toFixed(2)} />
        <Stat label="engaged P(right) at contrast −1" value={eng[0].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The pooled curve looks like a single observer with large lapses. Separating the states shows a near-perfect observer part of the time and a biased one the rest.</p>
    </div>
  );
}
