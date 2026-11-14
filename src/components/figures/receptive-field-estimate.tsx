"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, solve, Stat } from "./util";

const P = 30;
const RF = Array.from({ length: P }, (_, i): number => Math.exp(-((i - 15) ** 2) / 30) * Math.cos((i - 15) * 0.6));

/** Estimating a one-dimensional receptive field from correlated stimuli, with and without regularisation. */
export function ReceptiveFieldEstimate() {
  const [n, setN] = useState(150);
  const [logLam, setLogLam] = useState(1.5);
  const data = useMemo(() => {
    const r = rng(555);
    const X = Array.from({ length: 1000 }, (): number[] => {
      const z = Array.from({ length: P + 4 }, () => gauss(r));
      return Array.from({ length: P }, (_, i): number => (z[i] + z[i + 1] + z[i + 2] + z[i + 3] + z[i + 4]) / Math.sqrt(5));
    });
    const y = X.map((x) => x.reduce((a, v, i) => a + v * RF[i], 0) + 2 * gauss(r));
    return { X, y };
  }, []);
  const lam = Math.pow(10, logLam);
  const est = (penalty: "none" | "ridge" | "smooth"): number[] => {
    const A = Array.from({ length: P }, (): number[] => Array(P).fill(0)), b = Array(P).fill(0);
    for (let t = 0; t < n; t++) { const x = data.X[t]; for (let i = 0; i < P; i++) { b[i] += x[i] * data.y[t]; for (let j = 0; j < P; j++) A[i][j] += x[i] * x[j]; } }
    if (penalty === "ridge") for (let i = 0; i < P; i++) A[i][i] += lam;
    if (penalty === "smooth") for (let i = 1; i < P - 1; i++) { const c = [i - 1, i, i + 1], d = [1, -2, 1]; for (let a = 0; a < 3; a++) for (let q = 0; q < 3; q++) A[c[a]][c[q]] += lam * d[a] * d[q]; }
    if (penalty === "none") for (let i = 0; i < P; i++) A[i][i] += 1e-6;
    return solve(A, b);
  };
  const ols = est("none"), ridge = est("ridge"), smooth = est("smooth");
  const err = (w: number[]): number => Math.sqrt(w.reduce((a, v, i) => a + (v - RF[i]) ** 2, 0) / RF.reduce((a, v) => a + v * v, 0));
  const sx = (i: number): number => 25 + i * 10, sy = (v: number): number => 85 - Math.max(-2, Math.min(2, v)) * 55;
  const line = (w: number[]): string => w.map((v, i) => `${sx(i)},${sy(v)}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 175" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Receptive field estimates">
        <line x1="25" x2="315" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <polyline points={line(ols)} fill="none" stroke="var(--ink-3)" strokeWidth="1" />
        <polyline points={line(ridge)} fill="none" stroke="var(--ai)" strokeWidth="1.6" />
        <polyline points={line(smooth)} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        <polyline points={line(RF)} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="28" y="14" fontSize="8" fill="var(--ink)">true</text>
        <text x="55" y="14" fontSize="8" fill="var(--ink-3)">least squares</text>
        <text x="115" y="14" fontSize="8" fill="var(--ai)">ridge</text>
        <text x="145" y="14" fontSize="8" fill="var(--neuro)">smoothness penalty</text>
        <text x="315" y="170" fontSize="8" textAnchor="end" fill="var(--ink-3)">stimulus pixel</text>
      </svg>
      <Slider label="trials" value={n} min={40} max={1000} step={10} onChange={setN} />
      <Slider label="log₁₀ λ" value={logLam} min={-1} max={4} step={0.1} onChange={setLogLam} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="error, least squares" value={err(ols).toFixed(2)} />
        <Stat label="error, ridge" value={err(ridge).toFixed(2)} />
        <Stat label="error, smoothness" value={err(smooth).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With correlated stimuli and noisy responses, least squares gives a jagged estimate. Ridge shrinks it towards zero; a penalty on the second difference shrinks it towards smooth shapes instead, which matches what real receptive fields look like. Errors are relative to the size of the true field.</p>
    </div>
  );
}
