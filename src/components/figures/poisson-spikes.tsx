"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

/** A Poisson neuron: spike counts across 200 trials, compared with the Poisson distribution. */
export function PoissonSpikes() {
  const [rate, setRate] = useState(10);
  const [dur, setDur] = useState(0.5);
  const [seed, setSeed] = useState(1);
  const lam = rate * dur;

  const { trains, counts } = useMemo(() => {
    const r = rng(seed * 997 + 3);
    const trains: number[][] = [];
    const counts: number[] = [];
    for (let k = 0; k < 200; k++) {
      const n = poisson(lam, r);
      counts.push(n);
      if (k < 12) trains.push(Array.from({ length: n }, () => r() * dur).sort((a, b) => a - b));
    }
    return { trains, counts };
  }, [lam, dur, seed]);

  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / (counts.length - 1);
  const maxK = Math.max(10, Math.ceil(lam + 4 * Math.sqrt(lam + 1)));
  const hist = new Array(maxK + 1).fill(0);
  counts.forEach((c) => { if (c <= maxK) hist[c]++; });
  const pmf = (k: number) => { let p = Math.exp(-lam); for (let i = 1; i <= k; i++) p *= lam / i; return p; };
  const top = Math.max(...hist.map((h) => h / 200), ...Array.from({ length: maxK + 1 }, (_, k) => pmf(k)));
  const bw = 540 / (maxK + 1);

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 140" className="w-full" role="img" aria-label="Twelve example spike trains">
        {trains.map((s, k) => s.map((t, j) => <line key={`${k}-${j}`} x1={40 + (t / dur) * 540} x2={40 + (t / dur) * 540} y1={6 + k * 11} y2={14 + k * 11} stroke="var(--ink)" />))}
        <text x="40" y="138" fontSize="10" fill="var(--ink-3)">0 s</text>
        <text x="580" y="138" fontSize="10" textAnchor="end" fill="var(--ink-3)">{dur} s</text>
      </svg>
      <svg viewBox="0 0 600 180" className="w-full" role="img" aria-label="Histogram of spike counts with the Poisson probabilities overlaid">
        {hist.map((h, k) => <rect key={k} x={40 + k * bw + 1} y={160 - (h / 200 / top) * 140} width={bw - 2} height={(h / 200 / top) * 140} fill="var(--accent)" opacity="0.75" />)}
        {Array.from({ length: maxK + 1 }, (_, k) => <circle key={k} cx={40 + (k + 0.5) * bw} cy={160 - (pmf(k) / top) * 140} r="3.5" fill="var(--neuro)" />)}
        <line x1="40" x2="580" y1="160" y2="160" stroke="var(--ink-3)" />
        {Array.from({ length: maxK + 1 }, (_, k) => k).filter((k) => k % Math.ceil((maxK + 1) / 12) === 0).map((k) => (
          <text key={k} x={40 + (k + 0.5) * bw} y="175" fontSize="10" textAnchor="middle" fill="var(--ink-3)">{k}</text>
        ))}
      </svg>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Firing rate" value={rate} min={1} max={60} step={1} unit="Hz" onChange={setRate} />
        <Slider label="Window" value={dur} min={0.1} max={2} step={0.1} unit="s" onChange={setDur} fmt={(v) => v.toFixed(1)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Expected count λ" value={lam.toFixed(1)} />
        <Stat label="Mean count" value={mean.toFixed(2)} />
        <Stat label="Variance" value={variance.toFixed(2)} />
        <Stat label="Fano factor" value={(variance / Math.max(mean, 1e-9)).toFixed(2)} />
      </div>
      <button className="btn" onClick={() => setSeed((s) => s + 1)}>Simulate 200 new trials</button>
      <p className="text-sm text-ink-2">Bars: how often each count happened in 200 simulated trials. Dots: the Poisson probability λᵏe⁻λ/k!. For a Poisson process the variance equals the mean, so the Fano factor is about 1.</p>
    </div>
  );
}
