"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

const H = 30;

/** Time-rescaling (KS) plot, with the discrete-time correction for the history model, for a refractory neuron with constant drive, judged by a constant-rate Poisson model or by the true history-dependent model. */
export function KSPlot() {
  const [depth, setDepth] = useState(5);
  const { zp, zg, crit } = useMemo(() => {
    const r = rng(2002), T = 40000, b = Math.log(0.03), h = Array.from({ length: H }, (_, i) => -depth * Math.exp(-(i + 1) / 2));
    const drive = new Array(T).fill(b), spikes: number[] = [];
    for (let t = 0; t < T; t++) {
      const n = poisson(Math.exp(drive[t]), r);
      if (n > 0) { spikes.push(t); for (let i = 1; i <= H && t + i < T; i++) drive[t + i] += n * h[i - 1]; }
    }
    const rate = spikes.length / T, cum: number[] = []; let c = 0;
    for (let t = 0; t < T; t++) { c += Math.exp(drive[t]); cum.push(c); }
    const tp: number[] = [], tg: number[] = [];
    for (let i = 1; i < spikes.length; i++) { tp.push((spikes[i] - spikes[i - 1]) * rate); const ls = Math.exp(drive[spikes[i]]); tg.push(cum[spikes[i]] - cum[spikes[i - 1]] - ls - Math.log(1 - r() * (1 - Math.exp(-ls)))); }
    const z = (tau: number[]) => tau.map((v) => 1 - Math.exp(-v)).sort((a, b2) => a - b2);
    return { zp: z(tp), zg: z(tg), crit: 1.63 / Math.sqrt(tp.length) };
  }, [depth]);
  const ks = (z: number[]) => Math.max(...z.map((v, i) => Math.max(Math.abs((i + 1) / z.length - v), Math.abs(v - i / z.length))));
  const W = 360, S = 220, x0 = 70, y0 = 230;
  const pts = (z: number[]) => z.filter((_, i) => i % 4 === 0).map((v, j) => { const q = (j * 4 + 0.5) / z.length; return `${x0 + q * S},${y0 - v * S}`; }).join(" ");
  const band = crit * S;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 250`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Time-rescaling plots for a Poisson model and a history-dependent model">
        <polygon points={`${x0},${y0 - band} ${x0 + S - band},${y0 - S} ${x0 + S},${y0 - S} ${x0 + S},${y0 - S + band} ${x0 + band},${y0} ${x0},${y0}`} fill="var(--line)" opacity="0.5" />
        <line x1={x0} y1={y0} x2={x0 + S} y2={y0 - S} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <rect x={x0} y={y0 - S} width={S} height={S} fill="none" stroke="var(--line)" />
        <polyline points={pts(zp)} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={pts(zg)} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x={x0 + S / 2} y="246" fontSize="9" textAnchor="middle" fill="var(--ink-3)">uniform quantile</text>
        <text x="8" y="20" fontSize="9" fill="var(--neuro)">Poisson model</text>
        <text x="8" y="34" fontSize="9" fill="var(--ai)">model with history</text>
        <text x="8" y="48" fontSize="9" fill="var(--ink-3)">grey: 99% band</text>
      </svg>
      <Slider label="refractory depth" value={depth} min={0} max={8} step={0.5} onChange={setDepth} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="KS, Poisson" value={ks(zp).toFixed(3)} />
        <Stat label="KS, with history" value={ks(zg).toFixed(3)} />
        <Stat label="critical value" value={crit.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each curve plots the sorted transformed intervals against where they would fall if the model were right. The constant-rate Poisson model expects many very short intervals that a refractory neuron never produces, so its curve bows above the diagonal at the start and leaves the band. The model that knows the neuron's history stays inside it. Set the depth to zero and both pass, because the neuron is then Poisson.</p>
    </div>
  );
}
