"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const erf = (x: number) => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };
const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));

/** Noise and signal distributions, criterion, and the ROC curve. */
export function SignalDetection() {
  const [d, setD] = useState(1.5);
  const [k, setK] = useState(0.75);
  const H = 1 - Phi(k - d), F = 1 - Phi(k);
  const xs = Array.from({ length: 121 }, (_, i) => -3 + i * 0.075);
  const pdf = (x: number, m: number) => Math.exp(-((x - m) ** 2) / 2) / Math.sqrt(2 * Math.PI);
  const sx = (x: number) => 15 + ((x + 3) / 9) * 200, sy = (p: number) => 150 - p * 300;
  const ks = Array.from({ length: 61 }, (_, i) => -4 + i * 0.15);
  const rx = (f: number) => 240 + f * 110, ry = (h: number) => 150 - h * 110;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 170" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Signal detection distributions and ROC">
        <polyline points={xs.map((x) => `${sx(x)},${sy(pdf(x, 0))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.8" />
        <polyline points={xs.map((x) => `${sx(x)},${sy(pdf(x, d))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        <line x1={sx(k)} x2={sx(k)} y1="20" y2="152" stroke="var(--ink)" strokeDasharray="3 3" />
        <text x={sx(k) + 3} y="26" fontSize="8" fill="var(--ink)">criterion</text>
        <text x="18" y="14" fontSize="8" fill="var(--ai)">noise</text>
        <text x="50" y="14" fontSize="8" fill="var(--neuro)">signal</text>
        <rect x="240" y="40" width="110" height="110" fill="none" stroke="var(--line)" />
        <line x1={rx(0)} y1={ry(0)} x2={rx(1)} y2={ry(1)} stroke="var(--line)" strokeDasharray="3 3" />
        <polyline points={ks.map((kk) => `${rx(1 - Phi(kk))},${ry(1 - Phi(kk - d))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        <circle cx={rx(F)} cy={ry(H)} r="4" fill="var(--ink)" />
        <text x="295" y="164" fontSize="8" textAnchor="middle" fill="var(--ink-3)">false-alarm rate</text>
        <text x="244" y="36" fontSize="8" fill="var(--ink-3)">hit rate</text>
      </svg>
      <Slider label="sensitivity d'" value={d} min={0} max={3} step={0.05} onChange={setD} fmt={(v) => v.toFixed(2)} />
      <Slider label="criterion k" value={k} min={-2} max={3} step={0.05} onChange={setK} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="hit rate" value={H.toFixed(2)} />
        <Stat label="false-alarm rate" value={F.toFixed(2)} />
        <Stat label="2AFC accuracy" value={Phi(d / Math.SQRT2).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Moving the criterion slides the dot along the curve: hits and false alarms change together. Only a change in d&apos; moves the curve itself.</p>
    </div>
  );
}
