"use client";

import { useState } from "react";
import { Slider } from "./util";

const TARGETS = ["square", "sawtooth", "pulse train"] as const;

/** Partial sums of a Fourier series approaching a periodic signal. */
export function FourierSeries() {
  const [kind, setKind] = useState<(typeof TARGETS)[number]>("square");
  const [N, setN] = useState(5);
  // Coefficients b_k of sin(kt) and a_k of cos(kt) on [0, 2π).
  const coef = (k: number): [number, number] => {
    if (kind === "square") return [0, k % 2 ? 4 / (Math.PI * k) : 0];
    if (kind === "sawtooth") return [0, (2 * (k % 2 ? 1 : -1)) / (Math.PI * k)];
    const d = 0.3;   // pulses of width d (radians) centred at 0, height 1
    return [(2 * Math.sin((k * d) / 2)) / (Math.PI * k), 0];
  };
  const target = (t: number) => {
    const u = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (kind === "square") return u < Math.PI ? 1 : -1;
    if (kind === "sawtooth") return ((u + Math.PI) % (2 * Math.PI)) / Math.PI - 1;
    return u < 0.15 || u > 2 * Math.PI - 0.15 ? 1 : 0;
  };
  const a0 = kind === "pulse train" ? 0.3 / (2 * Math.PI) : 0;
  const partial = (t: number) => { let s = a0; for (let k = 1; k <= N; k++) { const [a, b] = coef(k); s += a * Math.cos(k * t) + b * Math.sin(k * t); } return s; };
  const W = 560, H = 200, X = (t: number) => 30 + (t / (4 * Math.PI)) * (W - 40), Y = (v: number) => 100 - v * 60;
  const pts = (fn: (t: number) => number) => Array.from({ length: 801 }, (_, i) => { const t = (i / 800) * 4 * Math.PI; return `${X(t)},${Y(Math.max(-1.6, Math.min(1.6, fn(t))))}`; }).join(" ");
  const mags = Array.from({ length: 20 }, (_, i) => Math.hypot(...coef(i + 1)));
  const mmax = Math.max(...mags) || 1;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TARGETS.map((k) => <button key={k} className={`btn !py-1.5 ${kind === k ? "btn-primary" : ""}`} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="A periodic signal and its Fourier partial sum">
        <line x1="30" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <polyline points={pts(target)} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="4 3" />
        <polyline points={pts(partial)} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
        <text x="34" y="16" fontSize="10" fill="var(--ink-3)">target (dashed) and the sum of the first {N} harmonics (two periods shown)</text>
      </svg>
      <svg viewBox="0 0 560 90" className="w-full rounded-lg bg-surface-2" role="img" aria-label="Amplitude of each harmonic">
        {mags.map((m, i) => <rect key={i} x={30 + i * 26} y={75 - (m / mmax) * 60} width="16" height={(m / mmax) * 60} fill={i < N ? "var(--accent)" : "var(--ink-3)"} opacity={i < N ? 1 : 0.4} />)}
        <text x="30" y="88" fontSize="9" fill="var(--ink-3)">amplitude of harmonics 1 to 20</text>
      </svg>
      <Slider label="number of harmonics" value={N} min={1} max={60} step={1} onChange={setN} />
      <p className="text-sm text-ink-2">Every periodic signal is a sum of sines and cosines at whole-number multiples of its basic frequency. A square wave needs only odd harmonics, falling off as 1/k. Sharp edges need many harmonics, and near a jump the partial sums overshoot by about 9% however many you add (the Gibbs phenomenon). A narrow pulse train spreads its power over many harmonics almost equally.</p>
    </div>
  );
}
