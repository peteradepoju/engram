"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

/** LIF neuron (τ = 20 ms, threshold 15 mV, 0.5 mV jumps) driven by Poisson excitation and inhibition, with excitation scaled to keep the output near 20 Hz. */
export function BalancedInput() {
  const [ri, setRi] = useState(0);
  const re = 1591 + 0.9516 * ri;
  const { trace, rate, cv } = useMemo(() => {
    const r = rng(1993 + ri), dt = 0.1, T = 4000, decay = Math.exp(-dt / 20);
    let V = 0, last = -1e9;
    const spikes: number[] = [], trace: number[] = [];
    for (let k = 0; k * dt < T; k++) {
      const t = k * dt;
      if (t - last >= 2) {
        V = V * decay + 0.5 * poisson((re * dt) / 1000, r) - 0.5 * poisson((ri * dt) / 1000, r);
        if (V >= 15) { spikes.push(t); V = 0; last = t; }
      }
      if (t < 600 && k % 5 === 0) trace.push(t - last < 0.5 ? 25 : V);
    }
    const isi = spikes.slice(1).map((s, i) => s - spikes[i]);
    const m = isi.reduce((a, b) => a + b, 0) / Math.max(isi.length, 1);
    const sd = Math.sqrt(isi.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(isi.length, 1));
    return { trace, rate: spikes.length / (T / 1000), cv: m > 0 ? sd / m : 0 };
  }, [ri, re]);
  const mu = (20 * (0.5 * re - 0.5 * ri)) / 1000, sigma = Math.sqrt((10 * (0.25 * re + 0.25 * ri)) / 1000);
  const W = 360, H = 180, x0 = 30, x1 = 350, y0 = 10, y1 = 170;
  const X = (i: number) => x0 + (i / (trace.length - 1)) * (x1 - x0);
  const Y = (v: number) => y1 - ((Math.max(-15, Math.min(25, v)) + 15) / 40) * (y1 - y0);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Membrane potential of a neuron receiving excitatory and inhibitory inputs">
        <line x1={x0} x2={x1} y1={Y(15)} y2={Y(15)} stroke="var(--warn)" strokeDasharray="4 3" />
        <text x={x1} y={Y(15) - 3} fontSize="9" textAnchor="end" fill="var(--warn)">threshold</text>
        <line x1={x0} x2={x1} y1={Y(mu)} y2={Y(mu)} stroke="var(--ai)" strokeDasharray="2 3" />
        <text x={x0 + 2} y={Y(mu) - 3} fontSize="9" fill="var(--ai)">mean free voltage</text>
        <line x1={x0} x2={x1} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <polyline points={trace.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.2" />
        <text x={x1} y={y1 + 8} fontSize="9" textAnchor="end" fill="var(--ink-3)">600 ms</text>
      </svg>
      <Slider label="inhibitory input rate" value={ri} min={0} max={12000} step={250} onChange={setRi} unit="Hz" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="excitatory rate" value={`${Math.round(re)} Hz`} />
        <Stat label="output" value={`${rate.toFixed(1)} Hz`} />
        <Stat label="CV of intervals" value={cv.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With excitation only, the mean free voltage ({mu.toFixed(1)} mV now) sits above threshold and the voltage ramps up to it after each spike, so intervals are similar. Add inhibition and raise excitation to match: the mean falls below threshold while the fluctuations (sd {sigma.toFixed(1)} mV) grow, and spikes come when a fluctuation crosses threshold, at irregular times.</p>
    </div>
  );
}
