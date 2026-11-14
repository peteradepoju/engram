"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const OBS = [1, 1, 0, 1, 1, 1, 0, 0, 0, 1];

/** Exact inference on a chain of binary states by forward and backward messages. */
export function ChainMessages() {
  const [stay, setStay] = useState(0.9);
  const [rel, setRel] = useState(0.75);
  const T = OBS.length;
  const emit = (z: number, x: number): number => (z === x ? rel : 1 - rel);
  const trans = (a: number, b: number): number => (a === b ? stay : 1 - stay);
  const fwd: number[][] = [], bwd: number[][] = Array.from({ length: T }, () => [1, 1]);
  for (let t = 0; t < T; t++) {
    const prev = t === 0 ? [0.5, 0.5] : [0, 1].map((b) => fwd[t - 1][0] * trans(0, b) + fwd[t - 1][1] * trans(1, b));
    const a = [0, 1].map((z) => prev[z] * emit(z, OBS[t])); const s = a[0] + a[1]; fwd.push([a[0] / s, a[1] / s]);
  }
  for (let t = T - 2; t >= 0; t--) {
    const b = [0, 1].map((z) => [0, 1].reduce((acc, z2) => acc + trans(z, z2) * emit(z2, OBS[t + 1]) * bwd[t + 1][z2], 0)); const s = b[0] + b[1]; bwd[t] = [b[0] / s, b[1] / s];
  }
  const marg = fwd.map((f, t) => { const p = [f[0] * bwd[t][0], f[1] * bwd[t][1]]; return p[1] / (p[0] + p[1]); });
  const flips = marg.filter((p, t) => (p > 0.5 ? 1 : 0) !== OBS[t]).length;
  const sx = (t: number): number => 25 + t * 30;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Chain marginals">
        {marg.map((p, t) => (
          <g key={t}>
            <rect x={sx(t) - 9} y={110 - p * 90} width="8" height={p * 90} fill="var(--ai)" />
            <rect x={sx(t) + 1} y={110 - fwd[t][1] * 90} width="8" height={fwd[t][1] * 90} fill="var(--neuro)" opacity="0.6" />
            <circle cx={sx(t)} cy="132" r="8" fill={OBS[t] ? "var(--ink)" : "none"} stroke="var(--ink)" />
          </g>
        ))}
        <line x1="10" x2="330" y1="110" y2="110" stroke="var(--line)" />
        <text x="12" y="14" fontSize="8" fill="var(--ai)">blue: P(state on | all observations)</text>
        <text x="170" y="14" fontSize="8" fill="var(--neuro)">pink: forward pass only (past)</text>
        <text x="12" y="152" fontSize="8" fill="var(--ink-3)">observations (filled = on)</text>
      </svg>
      <Slider label="probability the hidden state persists" value={stay} min={0.5} max={0.99} step={0.01} onChange={setStay} fmt={(v) => v.toFixed(2)} />
      <Slider label="reliability of each observation" value={rel} min={0.5} max={0.99} step={0.01} onChange={setRel} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="observations overruled by the chain" value={`${flips} of ${T}`} />
        <Stat label="messages computed" value={`${2 * T}`} />
      </div>
      <p className="text-sm text-ink-2">A hidden binary state persists from step to step and is observed noisily. Forward messages carry the evidence from the past, backward messages from the future; their product gives each step's exact marginal in time proportional to the length of the chain. With persistent states and unreliable observations, isolated observations are overruled by their neighbours.</p>
    </div>
  );
}
