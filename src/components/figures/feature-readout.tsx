"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

function solve(A: number[][], b: number[]) {
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}

function ridgeR2(F: number[][], y: number[], nTr: number, te0: number) {
  const d = F[0].length + 1, A = Array.from({ length: d }, () => new Array(d).fill(0)), b = new Array(d).fill(0);
  for (let t = 0; t < nTr; t++) { const f = [...F[t], 1]; for (let i = 0; i < d; i++) { b[i] += f[i] * y[t]; for (let j = 0; j < d; j++) A[i][j] += f[i] * f[j]; } }
  for (let i = 0; i < d; i++) A[i][i] += 1;
  const w = solve(A, b);
  let m = 0; for (let t = te0; t < y.length; t++) m += y[t]; m /= y.length - te0;
  let ss = 0, st = 0;
  for (let t = te0; t < y.length; t++) { const p = [...F[t], 1].reduce((s, v, i) => s + v * w[i], 0); ss += (y[t] - p) ** 2; st += (y[t] - m) ** 2; }
  return 1 - ss / st;
}

/** A pooled edge-detector neuron on 32-pixel stimuli, fitted by ridge readouts from pixels, 64 random ReLU features or 16 pooled Gabor-like filters, with training-set size as a slider. */
export function FeatureReadout() {
  const [nTr, setNTr] = useState(400);
  const data = useMemo(() => {
    const r = rng(14), P = 32, N = 2600, X = Array.from({ length: N }, () => Array.from({ length: P }, () => gauss(r)));
    const conv = (x: number[], f: number[]) => { let s = 0; for (let j = 0; j + f.length <= P; j++) { let v = 0; for (let k = 0; k < f.length; k++) v += x[j + k] * f[k]; s += Math.max(0, v); } return s; };
    const norm = (f: number[]) => { const n = Math.hypot(...f); return f.map((v) => v / n); };
    const g = norm([-1, -0.5, 1, 2, 1, -0.5, -1]);
    const clean = X.map((x) => conv(x, g)), mu = clean.reduce((a, b) => a + b, 0) / N;
    const sd = 0.5 * Math.sqrt(clean.reduce((a, b) => a + (b - mu) ** 2, 0) / N);
    const y = clean.map((c) => c + sd * gauss(r));
    const Wr = Array.from({ length: 64 }, () => Array.from({ length: P }, () => gauss(r) / Math.sqrt(P)));
    const bank: number[][] = [];
    for (const f of [0.5, 0.8, 1.2, 1.6]) for (const ph of [0, Math.PI / 2, Math.PI, 1.5 * Math.PI]) bank.push(norm([-3, -2, -1, 0, 1, 2, 3].map((t) => Math.exp(-(t * t) / 6) * Math.cos(f * t + ph))));
    return {
      y,
      pixels: X,
      random: X.map((x) => Wr.map((w) => Math.max(0, w.reduce((s, v, i) => s + v * x[i], 0)))),
      bank: X.map((x) => bank.map((b) => conv(x, b))),
    };
  }, []);
  const res = useMemo(() => ({
    pixels: ridgeR2(data.pixels, data.y, nTr, 2000),
    random: ridgeR2(data.random, data.y, nTr, 2000),
    bank: ridgeR2(data.bank, data.y, nTr, 2000),
  }), [data, nTr]);
  const W = 360, H = 200, ceil = 0.8, rows: [string, number, string][] = [["pixels (32)", res.pixels, "var(--ink-3)"], ["random ReLU (64)", res.random, "var(--neuro)"], ["pooled filter bank (16)", res.bank, "var(--ai)"]];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Held-out R squared of three encoding models">
        {rows.map(([label, v, col], i) => (
          <g key={label}>
            <text x="10" y={36 + i * 52} fontSize="10" fill="var(--ink-2)">{label}</text>
            <rect x="10" y={42 + i * 52} width={Math.max(0, v) * 330} height="16" rx="3" fill={col} />
            <text x={14 + Math.max(0, v) * 330} y={54 + i * 52} fontSize="10" fill="var(--ink)">{v.toFixed(2)}</text>
          </g>
        ))}
        <line x1={10 + ceil * 330} x2={10 + ceil * 330} y1="20" y2={H - 10} stroke="var(--ink-3)" strokeDasharray="4 3" />
        <text x={6 + ceil * 330} y="16" fontSize="9" textAnchor="end" fill="var(--ink-3)">noise ceiling 0.8</text>
      </svg>
      <Slider label="training stimuli" value={nTr} min={50} max={2000} step={50} onChange={setNTr} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="pixels" value={(res.pixels / ceil).toFixed(2)} />
        <Stat label="random" value={(res.random / ceil).toFixed(2)} />
        <Stat label="filter bank" value={(res.bank / ceil).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The numbers below the bars are fractions of the noise ceiling. With few training stimuli the 64 random features overfit and can do worse than pixels, while the 16 pooled filters, which already have the right structure, are close to the ceiling from a few hundred stimuli. More data helps the random features but never closes the gap, because they span the wrong space.</p>
    </div>
  );
}
