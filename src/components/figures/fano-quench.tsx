"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

/** A doubly stochastic neuron, 10 Hz before and 40 Hz after a stimulus at 0 ms, with trial-to-trial gain (log-normal, mean 1) of adjustable CV before and after. */
export function FanoQuench() {
  const [cvPre, setCvPre] = useState(0.5);
  const [cvPost, setCvPost] = useState(0.15);
  const { raster, centres, fano, psth } = useMemo(() => {
    const r = rng(2010), trials = 160, T0 = -500, T1 = 1000;
    const lnGain = (cv: number) => { const s = Math.sqrt(Math.log(1 + cv * cv)); return Math.exp(s * gauss(r) - (s * s) / 2); };
    const spikes: number[][] = [];
    for (let i = 0; i < trials; i++) {
      const gPre = lnGain(cvPre), gPost = lnGain(cvPost), row: number[] = [];
      for (let t = T0; t < T1; t++) if (r() < ((t < 0 ? 10 * gPre : 40 * gPost) / 1000)) row.push(t);
      spikes.push(row);
    }
    const centres: number[] = [], fano: number[] = [], psth: number[] = [];
    for (let s = T0; s <= T1 - 200; s += 50) {
      const c = spikes.map((row) => row.filter((t) => t >= s && t < s + 200).length);
      const m = c.reduce((a, b) => a + b, 0) / trials, v = c.reduce((a, b) => a + (b - m) ** 2, 0) / trials;
      centres.push(s + 100); fano.push(v / Math.max(m, 1e-9)); psth.push(m / 0.2);
    }
    return { raster: spikes.slice(0, 24), centres, fano, psth };
  }, [cvPre, cvPost]);
  const W = 360, H = 240, x0 = 30, x1 = 350;
  const X = (t: number) => x0 + ((t + 500) / 1500) * (x1 - x0);
  const Yf = (f: number) => 230 - ((Math.min(f, 3) - 0.5) / 2.5) * 70;
  const pre = fano.filter((_, i) => centres[i] < -100), post = fano.filter((_, i) => centres[i] > 300);
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Raster and Fano factor of a neuron before and after stimulus onset">
        <line x1={X(0)} x2={X(0)} y1="6" y2={H - 4} stroke="var(--warn)" strokeDasharray="3 3" />
        <text x={X(0) + 3} y="12" fontSize="9" fill="var(--warn)">stimulus</text>
        {raster.map((row, i) => row.map((t, j) => <line key={`${i}-${j}`} x1={X(t)} x2={X(t)} y1={16 + i * 5} y2={20 + i * 5} stroke="var(--neuro)" strokeWidth="1" />))}
        <text x={x0} y="148" fontSize="9" fill="var(--ink-3)">Fano factor in 200 ms windows (dashed: 1, Poisson)</text>
        <line x1={x0} x2={x1} y1={Yf(1)} y2={Yf(1)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <polyline points={centres.map((c, i) => `${X(c)},${Yf(fano[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
      </svg>
      <Slider label="rate variability before (CV across trials)" value={cvPre} min={0} max={1} step={0.05} onChange={setCvPre} fmt={(v) => v.toFixed(2)} />
      <Slider label="rate variability after" value={cvPost} min={0} max={1} step={0.05} onChange={setCvPost} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Fano before" value={avg(pre).toFixed(2)} />
        <Stat label="Fano after" value={avg(post).toFixed(2)} />
        <Stat label="rate after" value={`${avg(psth.filter((_, i) => centres[i] > 300)).toFixed(0)} Hz`} />
      </div>
      <p className="text-sm text-ink-2">Each row is one trial; each trial's rate is scaled by its own random gain. With no gain variability the Fano factor sits at 1, whatever the rate. Variable gains add variance in proportion to the square of the mean count, so the same gain variability gives a bigger Fano factor at the higher rate after the stimulus: reduce it after onset to see quenching.</p>
    </div>
  );
}
