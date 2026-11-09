"use client";

import { useState } from "react";
import { condColour, useChurchland } from "./churchland-data";
import { Slider } from "./util";

/** The 108 conditions as trajectories in a chosen pair of principal components. */
export function ReachTrajectories() {
  const d = useChurchland();
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [ti, setTi] = useState(20);
  if (!d) return <div className="h-72 animate-pulse rounded-lg bg-surface-2" aria-label="Loading data" />;
  const Z = d.pcs, all = Z.flatMap((c) => [...c[a], ...c[b]]), m = Math.max(...all.map(Math.abs)) * 1.05;
  const W = 360, H = 300, X = (v: number) => W / 2 + (v / m) * (W / 2 - 14), Y = (v: number) => H / 2 - (v / m) * (H / 2 - 14);
  const starts = Z.map((c) => c[a][0]), lo = Math.min(...starts), hi = Math.max(...starts);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Population trajectories in two principal components">
        <line x1="10" x2={W - 10} y1={H / 2} y2={H / 2} stroke="var(--line)" />
        <line x1={W / 2} x2={W / 2} y1="10" y2={H - 10} stroke="var(--line)" />
        {Z.map((c, i) => <polyline key={i} points={c[a].slice(0, ti + 1).map((v, j) => `${X(v)},${Y(c[b][j])}`).join(" ")} fill="none" stroke={condColour((c[a][0] - lo) / (hi - lo))} strokeWidth="1" opacity="0.8" />)}
        {Z.map((c, i) => <circle key={i} cx={X(c[a][ti])} cy={Y(c[b][ti])} r="1.8" fill={condColour((c[a][0] - lo) / (hi - lo))} />)}
        <text x={W - 12} y={H / 2 - 5} fontSize="10" textAnchor="end" fill="var(--ink-3)">PC{a + 1}</text>
        <text x={W / 2 + 5} y="20" fontSize="10" fill="var(--ink-3)">PC{b + 1}</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm"><span className="text-ink-2">horizontal axis</span>
          <select className="input mt-1" value={a} onChange={(e) => setA(Number(e.target.value))}>{[0, 1, 2, 3, 4, 5].map((i) => <option key={i} value={i}>PC{i + 1}</option>)}</select></label>
        <label className="block text-sm"><span className="text-ink-2">vertical axis</span>
          <select className="input mt-1" value={b} onChange={(e) => setB(Number(e.target.value))}>{[0, 1, 2, 3, 4, 5].map((i) => <option key={i} value={i}>PC{i + 1}</option>)}</select></label>
        <Slider label="time" value={ti} min={0} max={20} step={1} onChange={setTi} fmt={(v) => `${d.window[v]} ms`} />
      </div>
      <p className="text-sm text-ink-2">Each line is one of the 108 reach conditions, followed from 50 ms before movement onset to the chosen time, coloured by where it starts. Some pairs of components show the conditions fanning out from different starting points; others hint at a common rotation. Projections are easy to over-read, which is why Day 4 fits a model instead of trusting the eye.</p>
    </div>
  );
}
