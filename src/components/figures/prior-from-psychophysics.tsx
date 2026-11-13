"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const erf = (x: number) => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };
const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));

/** Psychometric functions for speed discrimination by a Bayesian observer with a slow prior. */
export function PriorFromPsychophysics() {
  const [a, setA] = useState(-1.2);
  const [sh, setSh] = useState(0.15);
  const [sl, setSl] = useState(0.35);
  const du = Array.from({ length: 81 }, (_, i) => -0.8 + i * 0.02);
  const p = (d: number, st: number) => Phi((d + a * (st * st - sh * sh)) / Math.sqrt(st * st + sh * sh));
  const sx = (d: number) => 30 + ((d + 0.8) / 1.6) * 310, sy = (v: number) => 150 - v * 130;
  const pse = -a * (sl * sl - sh * sh);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 170" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Psychometric functions">
        <line x1="30" x2="340" y1={sy(0.5)} y2={sy(0.5)} stroke="var(--line)" strokeDasharray="3 3" />
        <line x1={sx(0)} x2={sx(0)} y1={sy(0)} y2={sy(1)} stroke="var(--line)" />
        <polyline points={du.map((d) => `${sx(d)},${sy(p(d, sh))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={du.map((d) => `${sx(d)},${sy(p(d, sl))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <circle cx={sx(pse)} cy={sy(0.5)} r="3.5" fill="var(--neuro)" />
        <text x="34" y="16" fontSize="8" fill="var(--ai)">high-contrast test</text>
        <text x="34" y="28" fontSize="8" fill="var(--neuro)">low-contrast test</text>
        <text x="340" y="165" fontSize="8" textAnchor="end" fill="var(--ink-3)">log speed, test minus reference</text>
      </svg>
      <Slider label="prior slope a" value={a} min={-3} max={1} step={0.05} onChange={setA} fmt={(v) => v.toFixed(2)} />
      <Slider label="noise at high contrast" value={sh} min={0.05} max={0.4} step={0.01} onChange={setSh} fmt={(v) => v.toFixed(2)} />
      <Slider label="noise at low contrast" value={sl} min={0.05} max={0.6} step={0.01} onChange={setSl} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="PSE of low-contrast test" value={`${pse >= 0 ? "+" : ""}${pse.toFixed(3)}`} />
        <Stat label="speed ratio for equality" value={Math.exp(pse).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With a flat prior (a = 0) the two curves cross 50% at the same point and differ only in steepness. A slow prior shifts the low-contrast curve right: the low-contrast test must move faster to be judged equal.</p>
    </div>
  );
}
