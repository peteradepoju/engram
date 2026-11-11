"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

const H = 40;

/** A GLM neuron with constant drive (30 Hz baseline) and a history filter h(t) = -depth·e^(-t/2) + rebound·e^(-((t-10)/4)²): the filter and the resulting interval distribution. */
export function HistoryFilter() {
  const [depth, setDepth] = useState(5);
  const [reb, setReb] = useState(0.8);
  const h = useMemo(() => Array.from({ length: H }, (_, i) => -depth * Math.exp(-(i + 1) / 2) + reb * Math.exp(-(((i + 1 - 10) / 4) ** 2))), [depth, reb]);
  const { isi, rate } = useMemo(() => {
    const r = rng(2005), T = 40000, b = Math.log(0.03), drive = new Array(T).fill(b), spikes: number[] = [];
    for (let t = 0; t < T; t++) {
      const n = poisson(Math.exp(drive[t]), r);
      if (n > 0) { spikes.push(t); for (let i = 1; i <= H && t + i < T; i++) drive[t + i] += n * h[i - 1]; }
    }
    return { isi: spikes.slice(1).map((s, i) => s - spikes[i]), rate: spikes.length / (T / 1000) };
  }, [h]);
  const bins = Array.from({ length: 40 }, (_, b) => isi.filter((d) => d >= b * 2 + 1 && d < b * 2 + 3).length);
  const bmax = Math.max(...bins, 1);
  const W = 360, H2 = 220;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H2}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="History filter and interval distribution of a GLM neuron">
        <text x="10" y="12" fontSize="9" fill="var(--ink-3)">history filter (0 to 40 ms)</text>
        <line x1="10" x2="350" y1="50" y2="50" stroke="var(--line)" />
        <polyline points={h.map((v, i) => `${10 + (i / (H - 1)) * 340},${50 - Math.max(-6, Math.min(2, v)) * 10}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="10" y="120" fontSize="9" fill="var(--ink-3)">interval histogram (1 to 80 ms)</text>
        {bins.map((n, b) => <rect key={b} x={10 + b * 8.5} y={212 - (n / bmax) * 80} width="7.5" height={(n / bmax) * 80} fill="var(--neuro)" />)}
      </svg>
      <Slider label="refractory depth" value={depth} min={0} max={8} step={0.1} onChange={setDepth} fmt={(v) => v.toFixed(1)} />
      <Slider label="rebound at about 10 ms" value={reb} min={0} max={2.5} step={0.05} onChange={setReb} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="firing rate" value={`${rate.toFixed(1)} Hz`} />
        <Stat label="intervals of 2 ms or less" value={`${((isi.filter((d) => d <= 2).length / Math.max(isi.length, 1)) * 100).toFixed(1)}%`} />
      </div>
      <p className="text-sm text-ink-2">With no history the neuron is Poisson: intervals are exponential and very short ones are the most common. A negative filter at short lags empties the first few milliseconds of the histogram, a refractory period. A positive bump near 10 ms makes intervals of about 10 ms more likely: the neuron starts to fire rhythmically, or in bursts if the bump is strong.</p>
    </div>
  );
}
