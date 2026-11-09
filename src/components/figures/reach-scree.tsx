"use client";

import { useState } from "react";
import { useChurchland } from "./churchland-data";
import { Slider, Stat } from "./util";

/** Variance explained by each principal component of the reaching data. */
export function ReachScree() {
  const d = useChurchland();
  const [k, setK] = useState(6);
  if (!d) return <div className="h-64 animate-pulse rounded-lg bg-surface-2" aria-label="Loading data" />;
  const ve = d.varExplained, cum = ve.map((_, i) => ve.slice(0, i + 1).reduce((a, b) => a + b, 0));
  const W = 360, H = 200, bw = (W - 50) / ve.length, Y = (v: number) => H - 24 - v * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Variance explained by each principal component">
        <line x1="34" x2={W - 10} y1={H - 24} y2={H - 24} stroke="var(--line)" />
        {ve.map((v, i) => <rect key={i} x={36 + i * bw} y={Y(v)} width={bw - 2} height={H - 24 - Y(v)} fill={i < k ? "var(--neuro)" : "var(--line)"} />)}
        <polyline points={cum.map((c, i) => `${36 + i * bw + bw / 2},${Y(c)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {[0, 0.5, 1].map((v) => <text key={v} x="30" y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v * 100}%</text>)}
        {[1, 5, 10, 15, 20].map((i) => <text key={i} x={36 + (i - 1) * bw + bw / 2} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{i}</text>)}
        <text x={W - 12} y="20" fontSize="10" textAnchor="end" fill="var(--ai)">cumulative</text>
        <text x={W - 12} y="34" fontSize="10" textAnchor="end" fill="var(--neuro)">each component</text>
      </svg>
      <Slider label="components kept" value={k} min={1} max={20} step={1} onChange={setK} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label={`variance in the top ${k}`} value={`${(cum[k - 1] * 100).toFixed(1)}%`} />
        <Stat label="neurons recorded" value="218" />
      </div>
      <p className="text-sm text-ink-2">Principal component analysis of 218 neurons over 108 conditions, from 50 ms before to 150 ms after movement onset, after soft-normalising each neuron and removing the average across conditions. A handful of components captures most of the variance: 218 neurons are, to a first approximation, moving through a space of far fewer dimensions.</p>
    </div>
  );
}
