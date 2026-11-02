"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const KERNELS = ["box", "Gaussian", "causal exponential"] as const;
const trueRate = (t: number) => 10 + 40 * Math.exp(-((t - 0.35) ** 2) / (2 * 0.04 ** 2)) + 25 * Math.exp(-((t - 0.7) ** 2) / (2 * 0.1 ** 2));

/** Estimating a firing rate by convolving a spike train with a smoothing kernel. */
export function ConvolveSpikes() {
  const [kind, setKind] = useState<(typeof KERNELS)[number]>("Gaussian");
  const [width, setWidth] = useState(30);
  const dt = 0.001, n = 1000;
  const spikes = useMemo(() => {
    const r = rng(1926), out: number[] = [];
    for (let trial = 0; trial < 10; trial++) for (let k = 0; k < n; k++) if (r() < trueRate(k * dt) * dt) out.push(k);
    return out;
  }, []);
  const w = width / 1000;
  const kern = (s: number) => {
    if (kind === "box") return Math.abs(s) <= w / 2 ? 1 / w : 0;
    if (kind === "Gaussian") return Math.exp(-(s * s) / (2 * w * w)) / (w * Math.sqrt(2 * Math.PI));
    return s >= 0 ? Math.exp(-s / w) / w : 0;
  };
  const est = useMemo(() => {
    const e = new Array(n).fill(0);
    const reach = Math.ceil((kind === "box" ? w / 2 : 5 * w) / dt);
    for (const k of spikes) for (let j = Math.max(0, k - reach); j < Math.min(n, k + reach + 1); j++) e[j] += kern((j - k) * dt) / 10;
    return e;
  }, [spikes, kind, w]);
  const mse = est.reduce((a, v, k) => a + (v - trueRate(k * dt)) ** 2, 0) / n;
  const W = 540, H = 260, X = (t: number) => 40 + t * (W - 60), Y = (r: number) => 200 - r * 2.4;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {KERNELS.map((k) => <button key={k} className={`btn !py-1.5 ${kind === k ? "btn-primary" : ""}`} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Spike raster and smoothed rate estimate">
        {spikes.map((k, i) => <line key={i} x1={X(k * dt)} x2={X(k * dt)} y1={212 + (i % 10) * 4} y2={215 + (i % 10) * 4} stroke="var(--ink-3)" />)}
        <polyline points={Array.from({ length: n }, (_, k) => `${X(k * dt)},${Y(trueRate(k * dt))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth="1.5" />
        <polyline points={est.map((v, k) => `${X(k * dt)},${Y(Math.min(v, 80))}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
        <g transform="translate(430, 20)">
          <rect width="90" height="50" rx="4" fill="var(--surface)" stroke="var(--line)" />
          <polyline points={Array.from({ length: 81 }, (_, i) => { const s = (i - 40) * 0.0025; return `${5 + i},${45 - Math.min(kern(s) * w, 1.1) * 35}`; }).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
          <text x="45" y="12" fontSize="9" textAnchor="middle" fill="var(--ink-3)">kernel (±0.1 s)</text>
        </g>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={X(t)} y="207" fontSize="9" textAnchor="middle" fill="var(--ink-3)">{t} s</text>)}
        <text x="44" y="16" fontSize="10" fill="var(--ink-3)">estimated rate (purple) and true rate (dashed), Hz; 10 trials of spikes below</text>
      </svg>
      <Slider label="kernel width" value={width} min={2} max={120} step={1} onChange={setWidth} unit="ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean squared error against the true rate" value={mse.toFixed(1)} />
        <Stat label="spikes (10 trials)" value={String(spikes.length)} />
      </div>
      <p className="text-sm text-ink-2">Each spike is replaced by a copy of the kernel, and the copies are added up: that is convolution. A narrow kernel follows every random spike (high variance); a wide one blurs the fast peak at 0.35 s (high bias). The error is smallest in between. The causal exponential uses only past spikes, as a downstream neuron must, so its estimate lags behind the truth.</p>
    </div>
  );
}
