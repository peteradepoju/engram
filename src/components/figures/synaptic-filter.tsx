"use client";

import { useState } from "react";
import { tmTrain } from "./tm-synapse";
import { Slider, Stat } from "./util";

const RATES = Array.from({ length: 41 }, (_, i) => 10 ** (i / 20)); // 1 to 100 Hz

/** Steady-state efficacy per spike (after 100 regular spikes) against input rate for a fixed depressing synapse and an adjustable facilitating one. */
export function SynapticFilter() {
  const [U, setU] = useState(0.05);
  const [tauD, setTauD] = useState(100);
  const [tauF, setTauF] = useState(1000);
  const dep = RATES.map((f) => tmTrain(0.5, 800, 0, f, 100)[99]);
  const fac = RATES.map((f) => tmTrain(U, tauD, tauF, f, 100)[99]);
  const W = 360, H = 200, x0 = 34, x1 = 350, y0 = 12, y1 = 180;
  const X = (f: number) => x0 + (Math.log10(f) / 2) * (x1 - x0);
  const ymax = Math.max(...dep, ...fac) * 1.05;
  const Y = (v: number) => y1 - (v / ymax) * (y1 - y0);
  const iPeak = fac.indexOf(Math.max(...fac));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Steady-state synaptic efficacy against input rate">
        {[1, 10, 100].map((f) => <text key={f} x={X(f)} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{f} Hz</text>)}
        <line x1={x0} x2={x1} y1={y1} y2={y1} stroke="var(--line)" />
        <polyline points={RATES.map((f, i) => `${X(f)},${Y(dep[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={RATES.map((f, i) => `${X(f)},${Y(fac[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <circle cx={X(RATES[iPeak])} cy={Y(fac[iPeak])} r="4" fill="var(--ai)" />
        <text x={x1} y={y0 + 6} fontSize="9" textAnchor="end" fill="var(--neuro)">depressing (U 0.5, τ_rec 800 ms)</text>
        <text x={x1} y={y0 + 18} fontSize="9" textAnchor="end" fill="var(--ai)">facilitating (adjustable)</text>
        <text x={x0 + 2} y={y0 + 6} fontSize="9" fill="var(--ink-3)">efficacy per spike</text>
      </svg>
      <Slider label="release fraction U" value={U} min={0.01} max={0.5} step={0.01} onChange={setU} fmt={(v) => v.toFixed(2)} />
      <Slider label="recovery time τ_rec" value={tauD} min={20} max={1000} step={10} onChange={setTauD} unit="ms" />
      <Slider label="facilitation time τ_F" value={tauF} min={50} max={2000} step={10} onChange={setTauF} unit="ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="preferred rate (simulated)" value={`${RATES[iPeak].toFixed(1)} Hz`} />
        <Stat label="estimate 1/√(U τ_rec τ_F)" value={`${(1000 / Math.sqrt(U * tauD * tauF)).toFixed(1)} Hz`} />
      </div>
      <p className="text-sm text-ink-2">The depressing synapse gives less per spike at every increase in rate. The facilitating one gives most at an intermediate rate: below it, facilitation fades between spikes; above it, resources run out. Raising the release fraction or slowing recovery moves the peak down and shrinks it, until the facilitating synapse becomes a depressing one.</p>
    </div>
  );
}
