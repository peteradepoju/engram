"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Multiplicative synaptic scaling after a drop in input drive. */
export function SynapticScaling() {
  const [drive, setDrive] = useState(0.3);
  const [tau, setTau] = useState(40);
  const w0 = [0.9, 0.6, 0.4, 0.25, 0.15];
  const target = 5, base = 5 / w0.reduce((a, b) => a + b, 0);
  const T = 400, pre = 60;
  const rates: number[] = []; let g = 1, a = target;
  for (let t = 0; t < T; t++) {
    const d = t < pre ? 1 : drive;
    const y = g * d * base * w0.reduce((p, q) => p + q, 0);
    a += (y - a) / 5;
    if (t >= pre) g *= 1 + (target - a) / (target * tau);
    rates.push(y);
  }
  const W = 360, H = 170, sx = (t: number) => 20 + (t / T) * 230, sy = (v: number) => H - 20 - (Math.min(v, 10) / 10) * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Synaptic scaling">
        <line x1="20" x2="250" y1={sy(target)} y2={sy(target)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <line x1={sx(pre)} x2={sx(pre)} y1="12" y2={H - 20} stroke="var(--line)" />
        <polyline points={rates.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <text x={sx(pre) + 3} y="20" fontSize="8" fill="var(--ink-3)">input cut</text>
        <text x="22" y={sy(target) - 4} fontSize="8" fill="var(--ink-3)">target 5 Hz</text>
        <text x="135" y={H - 6} fontSize="8" textAnchor="middle" fill="var(--ink-3)">time</text>
        {w0.map((w, i) => (
          <rect key={i} x={265 + i * 15} y={H - 20 - (w / 0.9) * 70} width="10" height={(w / 0.9) * 70} fill="var(--ai)" opacity="0.7" />
        ))}
        <text x="302" y={H - 6} fontSize="8" textAnchor="middle" fill="var(--ink-3)">weight ratios</text>
      </svg>
      <Slider label="input drive after the cut" value={drive} min={0.1} max={1.5} step={0.05} onChange={setDrive} fmt={(v) => `${Math.round(v * 100)}%`} />
      <Slider label="scaling time constant" value={tau} min={5} max={200} step={5} onChange={setTau} unit="steps" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="final rate" value={`${rates[T - 1].toFixed(2)} Hz`} />
        <Stat label="every weight multiplied by" value={g.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The bars show the relative strengths of five synapses. Scaling multiplies them all by the same factor, so their ratios, and the bars, stay as they were. A drive above 100% mimics bicuculline: the rate rises and scaling turns the weights down.</p>
    </div>
  );
}
