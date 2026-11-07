"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Fixed points of the self-exciting population τ dr/dt = −r + F(w r + I) against the input I: an S-shaped curve with two saddle-node points and hysteresis. */
export function BifurcationDiagram() {
  const [w, setW] = useState(8);
  const [I, setI] = useState(-1);
  const F = (u: number) => 1 / (1 + Math.exp(-(u - 4)));
  // On the curve of fixed points, I = F⁻¹(r) − w r, which is single valued in r.
  const branch = useMemo(() => Array.from({ length: 400 }, (_, i) => {
    const r = 0.0025 + i * 0.0025 * 0.9975, Ir = 4 + Math.log(r / (1 - r)) - w * r;
    const slope = w * F(w * r + Ir) * (1 - F(w * r + Ir)) - 1;   // f'(r) at the fixed point
    return { r, I: Ir, stable: slope < 0 };
  }), [w]);
  const lo = -6, hi = 4;
  const W = 360, H = 210, X = (i: number) => 30 + ((i - lo) / (hi - lo)) * (W - 40), Y = (r: number) => H - 26 - r * (H - 40);
  const segs: { pts: string; stable: boolean }[] = [];
  branch.forEach((p, k) => {
    if (p.I < lo || p.I > hi) return;
    const last = segs[segs.length - 1];
    if (!last || last.stable !== p.stable || k === 0) segs.push({ pts: `${X(p.I)},${Y(p.r)}`, stable: p.stable });
    else last.pts += ` ${X(p.I)},${Y(p.r)}`;
  });
  const here = branch.filter((p, k) => k > 0 && (branch[k - 1].I - I) * (p.I - I) <= 0);
  const knees = branch.filter((p, k) => k > 0 && k < branch.length - 1 && (p.I - branch[k - 1].I) * (branch[k + 1].I - p.I) < 0).map((p) => p.I);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Fixed points of the population rate against input">
        <line x1="30" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        <line x1="30" x2="30" y1="10" y2={H - 26} stroke="var(--line)" />
        {knees.map((k, i) => <line key={i} x1={X(k)} x2={X(k)} y1="12" y2={H - 26} stroke="var(--warn)" strokeDasharray="3 3" />)}
        {segs.map((s, i) => <polyline key={i} points={s.pts} fill="none" stroke={s.stable ? "var(--neuro)" : "var(--ink-3)"} strokeWidth={s.stable ? 2.5 : 1.5} strokeDasharray={s.stable ? undefined : "5 4"} />)}
        <line x1={X(I)} x2={X(I)} y1="10" y2={H - 26} stroke="var(--ai)" strokeWidth="1.5" />
        {here.map((p, i) => <circle key={i} cx={X(I)} cy={Y(p.r)} r="5" fill={p.stable ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink)" strokeWidth="2" />)}
        {[-6, -4, -2, 0, 2, 4].map((v) => <text key={v} x={X(v)} y={H - 10} fontSize="10" textAnchor={v === 4 ? "end" : "middle"} fill="var(--ink-3)">{v}</text>)}
        {[0, 0.5, 1].map((v) => <text key={v} x="26" y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text>)}
        <text x="36" y="22" fontSize="10" fill="var(--ink-3)">rate r against input I</text>
        <text x="36" y="36" fontSize="9" fill="var(--ink-3)">solid stable · dashed unstable</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="input I" value={I} min={lo} max={hi} step={0.05} onChange={setI} />
        <Slider label="recurrent weight w" value={w} min={2} max={10} step={0.1} onChange={setW} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fixed points at this input" value={`${here.length}`} />
        <Stat label="saddle-node points" value={knees.length ? knees.map((k) => k.toFixed(2)).join(", ") : "none"} />
      </div>
      <p className="text-sm text-ink-2">Each input gives the population its own fixed points (Week 22, Day 1). Stacking them for every input draws this curve. For strong recurrence it folds into an S: between the two dashed lines there are three fixed points, outside them only one. At each fold a stable and an unstable fixed point collide and vanish, a saddle-node bifurcation. Sweep the input up and the rate jumps at the right fold; sweep it down and it jumps back only at the left one. That lag is hysteresis.</p>
    </div>
  );
}
