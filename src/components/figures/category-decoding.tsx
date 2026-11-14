"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

function phi(z: number): number { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp((-z * z) / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }

/** Accuracy of an optimal linear decoder of a binary category over time, as neurons are added, with and without correlated noise. */
export function CategoryDecoding() {
  const [N, setN] = useState(64);
  const [rho, setRho] = useState(0.05);
  const ts = Array.from({ length: 61 }, (_, i): number => -50 + i * 5);
  const d1 = (t: number): number => (t < 80 ? 0 : 0.35 * (1 - Math.exp(-(t - 80) / 25)) * (t > 200 ? Math.exp(-(t - 200) / 80) * 0.5 + 0.5 : 1));
  const acc = (t: number, n: number): number => { const d2 = (n * d1(t) ** 2) / (1 + (n - 1) * rho); return phi(Math.sqrt(d2) / 2); };
  const sx = (t: number): number => 30 + ((t + 50) / 300) * 290, sy = (a: number): number => 150 - (a - 0.5) * 2 * 130;
  const sizes = [1, 4, 16, 64, 256];
  const peak = Math.max(...ts.map((t) => acc(t, N)));
  const limit = phi(Math.sqrt(0.35 ** 2 / rho) / 2);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 175" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Decoding accuracy over time">
        <line x1="30" x2="320" y1={sy(0.5)} y2={sy(0.5)} stroke="var(--line)" />
        <line x1={sx(0)} x2={sx(0)} y1="15" y2="150" stroke="var(--line)" strokeDasharray="3 3" />
        {sizes.map((n) => <polyline key={n} points={ts.map((t) => `${sx(t)},${sy(acc(t, n))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="0.8" />)}
        <polyline points={ts.map((t) => `${sx(t)},${sy(acc(t, N))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.2" />
        <text x={sx(0) + 3} y="22" fontSize="8" fill="var(--ink-3)">stimulus onset</text>
        <text x="320" y="168" fontSize="8" textAnchor="end" fill="var(--ink-3)">time (ms)</text>
        <text x="34" y={sy(0.5) - 3} fontSize="8" fill="var(--ink-3)">chance</text>
      </svg>
      <Slider label="neurons decoded" value={N} min={1} max={512} step={1} onChange={setN} />
      <Slider label="noise correlation between neurons" value={rho} min={0} max={0.3} step={0.005} onChange={setRho} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak accuracy" value={peak.toFixed(3)} />
        <Stat label="limit with infinitely many neurons" value={rho > 0 ? limit.toFixed(3) : "1.000"} />
      </div>
      <p className="text-sm text-ink-2">Grey curves show 1, 4, 16, 64 and 256 neurons. Each neuron alone barely distinguishes the categories, but a population read out linearly can be near perfect within about 100 ms of the response. With correlated noise, adding neurons stops helping: accuracy saturates at a limit set by the correlation.</p>
    </div>
  );
}
