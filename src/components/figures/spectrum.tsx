"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Eigenvalue spectra and what they say about dimensionality. */
export function Spectrum() {
  const [alpha, setAlpha] = useState(1);
  const [noise, setNoise] = useState(0.002);
  const N = 200;
  const lam = Array.from({ length: N }, (_, i) => Math.pow(i + 1, -alpha) + noise);
  const total = lam.reduce((a, v) => a + v, 0);
  const pr = total ** 2 / lam.reduce((a, v) => a + v * v, 0);
  let cum = 0, n90 = N;
  for (let i = 0; i < N; i++) { cum += lam[i]; if (cum >= 0.9 * total) { n90 = i + 1; break; } }
  const W = 520, H = 240, lx = (n: number) => 46 + (Math.log10(n) / Math.log10(N)) * (W - 66), ly = (v: number) => 20 + ((0 - Math.log10(v)) / 4.5) * (H - 50);
  const fmt = (v: number) => v.toFixed(1);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Eigenvalue spectrum on log-log axes">
        {[1, 10, 100].map((n) => <g key={n}><line x1={lx(n)} x2={lx(n)} y1="16" y2={H - 30} stroke="var(--line)" /><text x={lx(n)} y={H - 16} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{n}</text></g>)}
        {[1, 0.1, 0.01, 0.001, 0.0001].map((v) => <g key={v}><line x1="46" x2={W - 20} y1={ly(v)} y2={ly(v)} stroke="var(--line)" /><text x="40" y={ly(v) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)">{v}</text></g>)}
        <polyline points={lam.map((v, i) => `${lx(i + 1)},${ly(v)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        {noise > 0 ? <line x1="46" x2={W - 20} y1={ly(noise)} y2={ly(noise)} stroke="var(--bad)" strokeDasharray="4 4" /> : null}
        <line x1={lx(n90)} x2={lx(n90)} y1="16" y2={H - 30} stroke="var(--neuro)" strokeDasharray="3 3" />
        <text x={n90 > 40 ? lx(n90) - 4 : lx(n90) + 4} y="28" fontSize="10" textAnchor={n90 > 40 ? "end" : "start"} fill="var(--neuro)">90% of variance</text>
        <text x={W / 2} y={H - 3} fontSize="10" textAnchor="middle" fill="var(--ink-3)">component number n (log scale)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="decay exponent α (variance ∝ n^−α)" value={alpha} min={0.3} max={3} step={0.05} onChange={setAlpha} fmt={(v) => v.toFixed(2)} />
        <Slider label="noise floor" value={noise} min={0} max={0.02} step={0.0005} onChange={setNoise} fmt={(v) => v.toFixed(4)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="components for 90%" value={String(n90)} />
        <Stat label="participation ratio" value={fmt(pr)} />
        <Stat label="slope on log-log plot" value={`−${alpha.toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">A spectrum is the list of covariance eigenvalues from largest to smallest. On log-log axes a power law is a straight line. Steep decay (large α) means a few dimensions dominate; shallow decay means activity spreads over many. Stringer and colleagues (2019) found α close to 1 for mouse visual cortex. A noise floor (red) flattens the tail and inflates dimensionality estimates: two numbers that summarise "how many dimensions" can disagree badly.</p>
    </div>
  );
}
