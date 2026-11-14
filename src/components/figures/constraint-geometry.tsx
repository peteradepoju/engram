"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const W_OLS = [1.6, 0.6];
const H = [[1.0, 0.45], [0.45, 0.6]];   // curvature of the squared-error bowl
const loss = (w: number[]): number => { const d = [w[0] - W_OLS[0], w[1] - W_OLS[1]]; return d[0] * (H[0][0] * d[0] + H[0][1] * d[1]) + d[1] * (H[1][0] * d[0] + H[1][1] * d[1]); };

/** Lasso and ridge as constrained least squares: the diamond's corners make zeros. */
export function ConstraintGeometry() {
  const [t, setT] = useState(0.8);
  const [l1, setL1] = useState(true);
  const pts = Array.from({ length: 2000 }, (_, i): number[] => {
    const a = (2 * Math.PI * i) / 2000;
    if (!l1) return [t * Math.cos(a), t * Math.sin(a)];
    const c = Math.cos(a), s = Math.sin(a), k = t / (Math.abs(c) + Math.abs(s));
    return [k * c, k * s];
  });
  const inside = l1 ? Math.abs(W_OLS[0]) + Math.abs(W_OLS[1]) <= t : Math.hypot(W_OLS[0], W_OLS[1]) <= t;
  const best = inside ? W_OLS : pts.reduce((b, p) => (loss(p) < loss(b) ? p : b), pts[0]);
  const sx = (v: number): number => 120 + v * 60, sy = (v: number): number => 120 - v * 60;
  const L0 = Math.max(loss(best), 0.01);
  const levels = [1, 2.2, 4, 6.5].map((c) => c * L0);
  const ellipse = (L: number): string => Array.from({ length: 121 }, (_, i): string => {
    const a = (2 * Math.PI * i) / 120, dir = [Math.cos(a), Math.sin(a)];
    const q = dir[0] * (H[0][0] * dir[0] + H[0][1] * dir[1]) + dir[1] * (H[1][0] * dir[0] + H[1][1] * dir[1]);
    const rr = Math.sqrt(L / q);
    return `${sx(W_OLS[0] + rr * dir[0])},${sy(W_OLS[1] + rr * dir[1])}`;
  }).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 190" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Constraint regions and loss contours">
        <line x1="10" x2="330" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <line x1={sx(0)} x2={sx(0)} y1="5" y2="185" stroke="var(--line)" />
        <polygon points={pts.filter((_, i) => i % 20 === 0).map((p) => `${sx(p[0])},${sy(p[1])}`).join(" ")} fill="var(--ai)" opacity="0.25" stroke="var(--ai)" />
        {levels.map((L, i) => <polyline key={i} points={ellipse(L)} fill="none" stroke="var(--ink-3)" strokeWidth="0.8" />)}
        <circle cx={sx(W_OLS[0])} cy={sy(W_OLS[1])} r="3.5" fill="var(--ink)" />
        <circle cx={sx(best[0])} cy={sy(best[1])} r="4.5" fill="var(--neuro)" />
        <text x={sx(W_OLS[0]) + 5} y={sy(W_OLS[1]) - 5} fontSize="8" fill="var(--ink)">least squares</text>
        <text x="326" y={sy(0) - 4} fontSize="8" textAnchor="end" fill="var(--ink-3)">w₁</text>
        <text x={sx(0) + 4} y="12" fontSize="8" fill="var(--ink-3)">w₂</text>
      </svg>
      <div className="flex gap-2">
        <button className={`btn !py-1 ${l1 ? "btn-primary" : ""}`} onClick={() => setL1(true)}>lasso: |w₁| + |w₂| ≤ t</button>
        <button className={`btn !py-1 ${!l1 ? "btn-primary" : ""}`} onClick={() => setL1(false)}>ridge: w₁² + w₂² ≤ t²</button>
      </div>
      <Slider label="budget t" value={t} min={0.1} max={2.4} step={0.05} onChange={setT} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="constrained solution" value={`(${best[0].toFixed(2)}, ${best[1].toFixed(2)})`} />
        <Stat label="zero coefficients" value={String(best.filter((v) => Math.abs(v) < 0.01).length)} />
      </div>
      <p className="text-sm text-ink-2">The solution is where the smallest loss contour touches the constraint region. The lasso's diamond has corners on the axes, and the contours usually touch a corner first, setting a weight exactly to zero. The ridge circle has no corners, so weights shrink but rarely vanish.</p>
    </div>
  );
}
