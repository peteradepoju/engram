"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

// Squared singular values of a design matrix with a decaying spectrum (as in correlated stimuli).
const D2 = Array.from({ length: 20 }, (_, j): number => 400 * Math.pow(0.7, j));

/** Ridge regression shrinks each principal direction of the inputs by d²/(d² + λ). */
export function RidgeShrinkage() {
  const [logLam, setLogLam] = useState(1);
  const lam = Math.pow(10, logLam);
  const f = D2.map((d) => d / (d + lam));
  const dof = f.reduce((a, b) => a + b, 0);
  const bw = 300 / D2.length;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Ridge shrinkage factors">
        {D2.map((d, j) => <rect key={`d${j}`} x={25 + j * bw + 2} y={140 - (Math.log10(d) + 2) / 5 * 120} width={bw - 4} height={(Math.log10(d) + 2) / 5 * 120} fill="var(--line)" />)}
        {f.map((v, j) => <rect key={j} x={25 + j * bw + bw / 4} y={140 - v * 120} width={bw / 2} height={v * 120} fill="var(--neuro)" />)}
        <line x1="25" x2="325" y1="20" y2="20" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x="27" y="15" fontSize="8" fill="var(--ink-3)">factor 1: no shrinkage</text>
        <text x="325" y="155" fontSize="8" textAnchor="end" fill="var(--ink-3)">principal directions, largest variance first</text>
        <text x="27" y="165" fontSize="8" fill="var(--neuro)">shrinkage factor</text>
        <text x="110" y="165" fontSize="8" fill="var(--ink-3)">grey: variance d² (log scale)</text>
      </svg>
      <Slider label="log₁₀ λ" value={logLam} min={-2} max={4} step={0.1} onChange={setLogLam} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="λ" value={lam < 10 ? lam.toFixed(2) : lam.toFixed(0)} />
        <Stat label="effective degrees of freedom (of 20)" value={dof.toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">Directions in which the inputs vary a lot are barely shrunk; directions with little variance, where the data say little and noise dominates, are shrunk almost to zero. The sum of the factors is the effective number of parameters the model uses.</p>
    </div>
  );
}
