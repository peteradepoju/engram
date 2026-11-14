"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, solve, Stat } from "./util";

const f = (x: number): number => Math.sin(3 * x) + 0.3 * x;

/** Kernel ridge regression with a Gaussian kernel: the length-scale and penalty set the fit's smoothness. */
export function KernelRidgeFit() {
  const [logEll, setLogEll] = useState(-0.7);
  const [logLam, setLogLam] = useState(-1);
  const data = useMemo(() => { const r = rng(572); return Array.from({ length: 30 }, (): [number, number] => { const x = 4 * r() - 2; return [x, f(x) + 0.3 * gauss(r)]; }); }, []);
  const ell = Math.pow(10, logEll), lam = Math.pow(10, logLam);
  const k = (a: number, b: number): number => Math.exp(-((a - b) ** 2) / (2 * ell * ell));
  const K = data.map(([a]) => data.map(([b]) => k(a, b)));
  const alpha = solve(K.map((row, i) => row.map((v, j) => v + (i === j ? lam : 0))), data.map((d) => d[1]));
  const pred = (x: number): number => data.reduce((s, [b], i) => s + alpha[i] * k(x, b), 0);
  const grid = Array.from({ length: 161 }, (_, i): number => -2.2 + i * 0.0275);
  const testErr = grid.reduce((s, x) => s + (pred(x) - f(x)) ** 2, 0) / grid.length + 0.09;
  const sx = (x: number): number => 20 + (x + 2.2) * 68, sy = (y: number): number => 90 - Math.max(-2.4, Math.min(2.4, y)) * 32;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 180" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Kernel ridge regression fit">
        <polyline points={grid.map((x) => `${sx(x)},${sy(f(x))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" />
        <polyline points={grid.map((x) => `${sx(x)},${sy(pred(x))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        {data.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r="3" fill="var(--ink)" />)}
        <text x="22" y="14" fontSize="8" fill="var(--neuro)">kernel ridge fit</text>
        <text x="100" y="14" fontSize="8" fill="var(--ink-3)">true function</text>
      </svg>
      <Slider label="log₁₀ length-scale ℓ" value={logEll} min={-1.6} max={0.8} step={0.05} onChange={setLogEll} fmt={(v) => v.toFixed(2)} />
      <Slider label="log₁₀ penalty λ" value={logLam} min={-4} max={1.5} step={0.1} onChange={setLogLam} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="length-scale ℓ" value={ell.toFixed(3)} />
        <Stat label="expected test MSE" value={testErr.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The fit is a weighted sum of Gaussian bumps, one centred on each training point. Short length-scales with little penalty chase every point; long ones smooth the sine away. The best fit balances the two, like the polynomial degree and ridge penalty of earlier weeks.</p>
    </div>
  );
}
