"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The linear-nonlinear-Poisson model: filter the stimulus, pass it through a nonlinearity, draw spikes. */
export function LnpModel() {
  const [delay, setDelay] = useState(6);
  const [biphasic, setBiphasic] = useState(0.6);
  const [thr, setThr] = useState(0.5);
  const [gain, setGain] = useState(3);
  const n = 300, L = 25;
  const { stim, u } = useMemo(() => { const r = rng(2001), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r()); return { stim: Array.from({ length: n + L }, g), u: Array.from({ length: n }, () => r()) }; }, []);
  const filt = Array.from({ length: L }, (_, k) => Math.exp(-((k - delay) ** 2) / 8) - biphasic * Math.exp(-((k - delay - 5) ** 2) / 18));
  const nrm = Math.sqrt(filt.reduce((a, v) => a + v * v, 0)) || 1;
  const drive = Array.from({ length: n }, (_, t) => filt.reduce((a, f, k) => a + (f / nrm) * stim[t + L - k], 0));
  const rate = drive.map((d) => Math.log(1 + Math.exp(gain * (d - thr))) * 0.25);   // softplus, spikes per bin
  const spikes = rate.map((r, t) => u[t] < 1 - Math.exp(-r));
  const W = 540, X = (t: number) => 40 + (t / n) * (W - 60);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W + 130} 300`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Stimulus, filtered drive, rate and spikes of an LNP model">
        <text x="44" y="14" fontSize="10" fill="var(--ink-3)">stimulus (white noise)</text>
        <polyline points={stim.slice(L).map((s, t) => `${X(t)},${48 - s * 10}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1" />
        <text x="44" y="98" fontSize="10" fill="var(--ink-3)">L: filtered stimulus (linear drive), with the threshold</text>
        <polyline points={drive.map((d, t) => `${X(t)},${140 - d * 14}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" />
        <line x1="40" x2={W - 20} y1={140 - thr * 14} y2={140 - thr * 14} stroke="var(--bad)" strokeDasharray="4 4" />
        <text x="44" y="190" fontSize="10" fill="var(--ink-3)">N: firing rate, and P: Poisson spikes</text>
        <polyline points={rate.map((r, t) => `${X(t)},${265 - Math.min(r, 2) * 30}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {spikes.map((s, t) => (s ? <line key={t} x1={X(t)} x2={X(t)} y1="272" y2="292" stroke="var(--neuro)" strokeWidth="1.5" /> : null))}
        <g transform="translate(550, 20)">
          <rect width="110" height="70" rx="4" fill="var(--surface)" stroke="var(--line)" />
          <polyline points={filt.map((f, k) => `${8 + k * 4},${38 - (f / nrm) * 50}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
          <text x="55" y="64" fontSize="9" textAnchor="middle" fill="var(--ink-3)">filter (time into the past →)</text>
        </g>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="filter delay" value={delay} min={1} max={12} step={1} onChange={setDelay} unit="bins" />
        <Slider label="negative lobe (0 = monophasic)" value={biphasic} min={0} max={1} step={0.05} onChange={setBiphasic} fmt={(v) => v.toFixed(2)} />
        <Slider label="threshold" value={thr} min={-1} max={2.5} step={0.05} onChange={setThr} fmt={(v) => v.toFixed(2)} />
        <Slider label="gain" value={gain} min={0.5} max={8} step={0.1} onChange={setGain} fmt={(v) => v.toFixed(1)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="spikes in 300 bins" value={String(spikes.filter(Boolean).length)} />
        <Stat label="mean rate (spikes per bin)" value={(rate.reduce((a, v) => a + v, 0) / n).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The linear stage convolves the stimulus with the filter: each moment's drive is a weighted sum of the recent past. The nonlinear stage turns drive into a non-negative rate. The Poisson stage draws spikes at that rate. A biphasic filter responds to changes rather than to the stimulus itself, as many retinal ganglion cells do; raising the threshold makes spikes sparser and more tightly locked to strong stimulus events.</p>
    </div>
  );
}
