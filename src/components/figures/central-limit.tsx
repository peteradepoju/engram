"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The central limit theorem: standardised sums of skewed draws look more and more Gaussian. */
export function CentralLimit() {
  const [k, setK] = useState(2);
  const [seed, setSeed] = useState(1);
  const z = useMemo(() => {
    const r = rng(seed * 31 + 5);
    return Array.from({ length: 4000 }, () => {
      let s = 0;
      for (let i = 0; i < k; i++) s += -Math.log(Math.max(r(), 1e-12));   // exponential draws: mean 1, variance 1
      return (s - k) / Math.sqrt(k);
    });
  }, [k, seed]);
  const W = 540, H = 220, lo = -3.5, hi = 4.5, bins = 48, bw = (hi - lo) / bins;
  const hist = new Array(bins).fill(0);
  z.forEach((v) => { const b = Math.floor((v - lo) / bw); if (b >= 0 && b < bins) hist[b]++; });
  const dens = hist.map((h) => h / (z.length * bw));
  const top = Math.max(0.5, ...dens) * 1.1;
  const X = (v: number) => 30 + ((v - lo) / (hi - lo)) * (W - 50), Y = (d: number) => H - 30 - (d / top) * (H - 50);
  const gauss = Array.from({ length: 161 }, (_, i) => { const v = lo + (i / 160) * (hi - lo); return `${X(v)},${Y(Math.exp(-v * v / 2) / Math.sqrt(2 * Math.PI))}`; }).join(" ");
  const mean = z.reduce((a, b) => a + b, 0) / z.length;
  const sd = Math.sqrt(z.reduce((a, b) => a + (b - mean) ** 2, 0) / z.length);
  const skew = z.reduce((a, b) => a + ((b - mean) / sd) ** 3, 0) / z.length;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Histogram of standardised sums against the standard Gaussian">
        {dens.map((d, b) => <rect key={b} x={X(lo + b * bw)} y={Y(d)} width={(W - 50) / bins - 1} height={H - 30 - Y(d)} fill="var(--ai)" opacity="0.75" />)}
        <polyline points={gauss} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <line x1="30" x2={W - 20} y1={H - 30} y2={H - 30} stroke="var(--line)" />
        {[-3, -2, -1, 0, 1, 2, 3, 4].map((v) => <text key={v} x={X(v)} y={H - 12} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
        <text x={W - 12} y="18" fontSize="11" textAnchor="end" fill="var(--ai)">standardised sum of {k} exponential draws</text>
        <text x={W - 12} y="34" fontSize="11" textAnchor="end" fill="var(--neuro)">standard Gaussian density</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label="number of draws added together" value={k} min={1} max={100} step={1} onChange={setK} />
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>New draws</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="mean" value={mean.toFixed(3)} />
        <Stat label="standard deviation" value={sd.toFixed(3)} />
        <Stat label="skewness (Gaussian: 0)" value={skew.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each sample is a sum of k independent exponential draws (think of k interspike intervals), shifted and scaled to have mean 0 and standard deviation 1. One draw is strongly skewed. As k grows the histogram approaches the Gaussian curve, whatever the shape of the original distribution, as long as its variance is finite. The skewness falls like 2/√k, so the tails are the last part to become Gaussian.</p>
    </div>
  );
}
