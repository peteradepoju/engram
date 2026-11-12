"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const DT = 0.005, TAU = 0.04, K = 0.3, HOLD = 40;

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }
const step = (x: number[], u: number) => [x[0] + DT * x[1], x[1] + DT * x[2], x[2] * (1 - DT / TAU) + (DT / TAU) * u];

function solve3(M: number[][], b: number[]) {
  const a = M.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < 3; c++) { let p = c; for (let i = c + 1; i < 3; i++) if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i; [a[c], a[p]] = [a[p], a[c]]; for (let i = c + 1; i < 3; i++) { const f = a[i][c] / a[c][c]; for (let j = c; j < 4; j++) a[i][j] -= f * a[c][j]; } }
  const x = [0, 0, 0]; for (let i = 2; i >= 0; i--) { let s = a[i][3]; for (let j = i + 1; j < 3; j++) s -= a[i][j] * x[j]; x[i] = s / a[i][i]; } return x;
}

/** Minimum-variance reach under signal-dependent noise (k = 0.3): planned velocity and the scatter of end points over 40 noisy repetitions. */
export function SignalDependentNoise() {
  const [D, setD] = useState(10);
  const [T, setT] = useState(0.4);
  const { vel, ends, sd } = useMemo(() => {
    const n = Math.round(T / DT), P: number[][] = [[0, 0, DT / TAU]];
    for (let j = 1; j < n + HOLD + 1; j++) P.push(step(P[j - 1], 0));
    const C = [0, 1, 2].map((r) => Array.from({ length: n }, (_, t) => P[n - 1 - t][r]));
    const a = Array.from({ length: n }, (_, t) => { let s = 0; for (let h = 1; h <= HOLD; h++) s += P[n - 1 - t + h][0] ** 2; return K * K * s + 1e-15; });
    const M = [0, 1, 2].map((i) => [0, 1, 2].map((j) => C[i].reduce((s, v, t) => s + (v * C[j][t]) / a[t], 0)));
    const lam = solve3(M, [D / 100, 0, 0]);
    const u = Array.from({ length: n }, (_, t) => (C[0][t] * lam[0] + C[1][t] * lam[1] + C[2][t] * lam[2]) / a[t]);
    let x = [0, 0, 0]; const vel: number[] = [];
    for (const ut of u) { x = step(x, ut); vel.push(x[1]); }
    const r = rng(1998), ends: number[] = [];
    for (let rep = 0; rep < 40; rep++) { let y = [0, 0, 0]; for (const ut of u) y = step(y, ut * (1 + K * gauss(r))); for (let h = 0; h < HOLD; h++) y = step(y, 0); ends.push(y[0] * 100); }
    const sd = Math.sqrt(a.reduce((s, v, t) => s + v * u[t] * u[t], 0) / HOLD) * 100;
    return { vel, ends, sd };
  }, [D, T]);
  const vmax = Math.max(...vel), W = 360;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 190`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Planned velocity and end-point scatter">
        <text x="12" y="13" fontSize="9" fill="var(--ink-3)">planned velocity</text>
        <polyline points={vel.map((v, i) => `${12 + (i / (vel.length - 1)) * 336},${100 - (v / vmax) * 80}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1="12" x2="348" y1="100" y2="100" stroke="var(--line)" />
        <text x="12" y="125" fontSize="9" fill="var(--ink-3)">end points of 40 noisy reaches (0 to 70 cm)</text>
        <line x1={12 + (D / 70) * 336} x2={12 + (D / 70) * 336} y1="132" y2="180" stroke="var(--ink)" strokeDasharray="3 3" />
        {ends.map((e, i) => <circle key={i} cx={12 + (Math.max(0, Math.min(70, e)) / 70) * 336} cy={140 + (i % 8) * 5} r="2.5" fill="var(--neuro)" opacity="0.7" />)}
      </svg>
      <Slider label="distance" value={D} min={5} max={60} step={1} onChange={setD} unit="cm" />
      <Slider label="duration" value={T} min={0.15} max={1} step={0.05} onChange={setT} unit="s" fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="predicted end-point spread" value={`${sd.toFixed(1)} cm`} />
        <Stat label="spread relative to distance" value={`${((sd / D) * 100).toFixed(0)}%`} />
      </div>
      <p className="text-sm text-ink-2">The plan is the one that minimises the spread of end points when every command carries noise proportional to its size. Lengthen the distance and the spread grows in proportion. Shorten the duration and the commands must be larger, so the spread grows quickly: speed is bought with accuracy. The noise level here is exaggerated so the scatter is visible.</p>
    </div>
  );
}
