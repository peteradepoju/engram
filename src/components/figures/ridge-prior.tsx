"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Ridge regression is MAP estimation with a Gaussian prior: the estimate slides from the least-squares point towards the prior's centre as λ grows. */
export function RidgePrior() {
  const [logLam, setLogLam] = useState(0);
  const lam = 10 ** logLam;
  // A badly conditioned two-weight problem: X'X and X'y
  const A = [[3.0, 2.6], [2.6, 2.6]], bv = [4.4, 3.2];
  const solve = (l: number) => { const a = A[0][0] + l, b = A[0][1], c = A[1][0], d = A[1][1] + l, det = a * d - b * c; return [(d * bv[0] - b * bv[1]) / det, (-c * bv[0] + a * bv[1]) / det]; };
  const ls = solve(0), map = solve(lam);
  const W = 340, C = W / 2, K = 38, P = (u: number, v: number) => [C + u * K, C - v * K];
  const path = Array.from({ length: 61 }, (_, i) => solve(10 ** (-3 + i / 10)));
  // likelihood contours: (w - ls)' A (w - ls) = c
  const ell = (c: number) => Array.from({ length: 121 }, (_, i) => { const t = (i / 120) * 2 * Math.PI, d = [Math.cos(t), Math.sin(t)]; const q = A[0][0] * d[0] * d[0] + 2 * A[0][1] * d[0] * d[1] + A[1][1] * d[1] * d[1]; const r = Math.sqrt(c / q); return P(ls[0] + r * d[0], ls[1] + r * d[1]).join(","); }).join(" ");
  const nrm = (w: number[]) => Math.hypot(w[0], w[1]);
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="Likelihood contours, a Gaussian prior and the MAP path">
        <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
        {[0.1, 0.4, 1, 2, 4].map((c) => <polygon key={c} points={ell(c)} fill="none" stroke="var(--ai)" opacity="0.6" />)}
        {[1, 2, 3, 4].map((r) => <circle key={r} cx={C} cy={C} r={r * K} fill="none" stroke="var(--warn)" opacity="0.5" strokeDasharray="4 3" />)}
        <polyline points={path.map((w) => P(w[0], w[1]).join(",")).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <circle cx={P(ls[0], ls[1])[0]} cy={P(ls[0], ls[1])[1]} r="5" fill="var(--ai)" />
        <circle cx={P(map[0], map[1])[0]} cy={P(map[0], map[1])[1]} r="6.5" fill="var(--neuro)" stroke="var(--surface)" strokeWidth="2" />
        <text x="8" y="16" fontSize="10" fill="var(--ai)">likelihood (data)</text>
        <text x="8" y="29" fontSize="10" fill="var(--warn)">Gaussian prior</text>
        <text x="8" y="42" fontSize="10" fill="var(--neuro)">MAP path as λ grows</text>
        <text x={W - 8} y={C + 14} fontSize="10" textAnchor="end" fill="var(--ink-3)">w1</text>
        <text x={C + 6} y="14" fontSize="10" fill="var(--ink-3)">w2</text>
      </svg>
      <div className="space-y-3">
        <Slider label="prior strength λ (log scale)" value={logLam} min={-3} max={3} step={0.05} onChange={setLogLam} fmt={() => lam < 0.01 ? lam.toExponential(1) : lam.toFixed(lam < 1 ? 2 : 1)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="least-squares weights" value={`(${ls[0].toFixed(2)}, ${ls[1].toFixed(2)})`} />
          <Stat label="MAP weights" value={`(${map[0].toFixed(2)}, ${map[1].toFixed(2)})`} />
          <Stat label="|w| least squares" value={nrm(ls).toFixed(2)} />
          <Stat label="|w| MAP" value={nrm(map).toFixed(2)} />
        </div>
        <p className="text-sm text-ink-2">The blue ellipses are contours of the likelihood of two weights; they are long and thin because the two inputs are correlated, so the data pin down their sum far better than their difference. The orange circles are a Gaussian prior centred on zero. The MAP estimate (pink) is where the two balance: as the prior strength λ grows it slides from the least-squares point towards zero, shrinking most along the poorly determined direction. This is ridge regression.</p>
      </div>
    </div>
  );
}
