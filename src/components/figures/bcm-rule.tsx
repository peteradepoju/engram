"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** The BCM function φ(y) = y(y − θ), with θ set by the recent mean of y². */
export function BCMRule() {
  const [hist, setHist] = useState(1.0);
  const [y, setY] = useState(0.8);
  const th = hist * hist;
  const W = 360, H = 200, ymax = 2.5;
  const phi = (v: number) => v * (v - th);
  const ys = Array.from({ length: 101 }, (_, i) => (i / 100) * ymax);
  const lo = -1.6, hi = 2.4;
  const sx = (v: number) => 30 + (v / ymax) * 310, sy = (p: number) => 15 + ((hi - Math.max(lo, Math.min(hi, p))) / (hi - lo)) * (H - 40);
  const d = phi(y);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="BCM plasticity function">
        <line x1="30" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <line x1="30" x2="30" y1="10" y2={H - 25} stroke="var(--line)" />
        <rect x={sx(0)} y="10" width={Math.max(0, sx(Math.min(th, ymax)) - sx(0))} height={H - 35} fill="var(--neuro-soft)" opacity="0.6" />
        <polyline points={ys.map((v) => `${sx(v)},${sy(phi(v))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {th <= ymax && <line x1={sx(th)} x2={sx(th)} y1="10" y2={H - 25} stroke="var(--ink-3)" strokeDasharray="3 3" />}
        {th <= ymax && <text x={sx(th) + 3} y="20" fontSize="9" fill="var(--ink-3)">θ = {th.toFixed(2)}</text>}
        <circle cx={sx(y)} cy={sy(d)} r="4" fill={d >= 0 ? "var(--ai)" : "var(--neuro)"} />
        <text x="34" y={H - 30} fontSize="9" fill="var(--neuro)">below θ: depression</text>
        <text x="338" y={H - 8} fontSize="9" textAnchor="end" fill="var(--ink-3)">postsynaptic activity y</text>
        <text x="34" y={sy(0) - 4} fontSize="8" fill="var(--ink-3)">φ = 0</text>
      </svg>
      <Slider label="recent typical activity (sets θ as its square)" value={hist} min={0.2} max={1.6} step={0.05} onChange={setHist} fmt={(v) => v.toFixed(2)} />
      <Slider label="test response y" value={y} min={0} max={ymax} step={0.05} onChange={setY} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="φ(y, θ)" value={d.toFixed(2)} />
        <Stat label="active synapses" value={d > 0 ? "potentiate" : d < 0 ? "depress" : "no change"} />
      </div>
      <p className="text-sm text-ink-2">Raise the recent activity and the threshold moves right: a test response that used to potentiate now depresses. This history dependence is what keeps BCM learning stable and what experiments on metaplasticity have tested.</p>
    </div>
  );
}
