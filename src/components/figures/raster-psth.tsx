"use client";

import { useMemo, useState } from "react";
import { rng, Slider } from "./util";

/** Spike rasters from 30 trials and the PSTH made from them. Change the bin width. */
export function RasterPSTH() {
  const [bin, setBin] = useState(25);
  const [trials, setTrials] = useState(30);
  const T = 1000;
  const rate = (t: number) => 8 + 55 * Math.exp(-((t - 350) ** 2) / (2 * 60 ** 2)) + 20 * Math.exp(-((t - 650) ** 2) / (2 * 40 ** 2));

  const spikes = useMemo(() => {
    const r = rng(42);
    const all: number[][] = [];
    for (let k = 0; k < 60; k++) {
      const s: number[] = [];
      for (let t = 0; t < T; t++) if (r() < rate(t) / 1000) s.push(t);
      all.push(s);
    }
    return all;
  }, []);

  const used = spikes.slice(0, trials);
  const nb = Math.ceil(T / bin);
  const counts = new Array(nb).fill(0);
  used.forEach((s) => s.forEach((t) => counts[Math.floor(t / bin)]++));
  const psth = counts.map((c) => c / (trials * (bin / 1000)));
  const maxR = Math.max(80, ...psth);
  const x = (t: number) => 40 + (t / T) * 540;

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 330" className="w-full" role="img" aria-label="Spike raster above and peri-stimulus time histogram below">
        {used.map((s, k) => s.map((t, j) => (
          <line key={`${k}-${j}`} x1={x(t)} x2={x(t)} y1={10 + k * (150 / trials)} y2={10 + (k + 0.8) * (150 / trials)} stroke="var(--ink)" strokeWidth="1" />
        )))}
        <text x="34" y="90" fontSize="11" textAnchor="end" fill="var(--ink-3)">trials</text>
        {psth.map((r, i) => (
          <rect key={i} x={x(i * bin)} y={310 - (r / maxR) * 130} width={Math.max(1, (bin / T) * 540 - 1)} height={(r / maxR) * 130} fill="var(--accent)" opacity="0.8" />
        ))}
        <path d={Array.from({ length: 101 }, (_, i) => `${i ? "L" : "M"}${x(i * 10)},${310 - (rate(i * 10) / maxR) * 130}`).join("")} fill="none" stroke="var(--neuro)" strokeWidth="2" strokeDasharray="5 3" />
        <line x1="40" x2="580" y1="310" y2="310" stroke="var(--ink-3)" />
        {[0, 250, 500, 750, 1000].map((t) => <text key={t} x={x(t)} y="325" fontSize="10" textAnchor="middle" fill="var(--ink-3)">{t} ms</text>)}
        <text x="34" y="250" fontSize="11" textAnchor="end" fill="var(--ink-3)">Hz</text>
      </svg>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Bin width" value={bin} min={2} max={200} step={1} unit="ms" onChange={setBin} />
        <Slider label="Number of trials" value={trials} min={1} max={60} step={1} onChange={setTrials} />
      </div>
      <p className="text-sm text-ink-2">Bars are the estimated firing rate; the dashed line is the true rate used to simulate the spikes. Small bins and few trials are noisy; large bins blur fast changes. This is the bias and variance trade-off you will meet again in Part 3.</p>
    </div>
  );
}
