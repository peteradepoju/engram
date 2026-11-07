"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";
import { eig2 } from "./linalg";

/** A two-compartment neuron (soma and dendrite): after a brief current pulse, the voltage is a sum of two exponential modes. */
export function CompartmentModes() {
  const [g, setG] = useState(0.5);       // coupling conductance relative to leak
  const tauS = 10, tauD = 30;
  const A = [[-1 / tauS - g / tauS, g / tauS], [g / tauD, -1 / tauD - g / tauD]];
  const e = eig2(A[0][0], A[0][1], A[1][0], A[1][1]);
  const lam = [e.l1, e.l2];
  const T = 120, dt = 0.1;
  const traces: number[][] = [[1, 0]];
  let v = [1, 0];
  for (let t = dt; t <= T; t += dt) { v = [v[0] + dt * (A[0][0] * v[0] + A[0][1] * v[1]), v[1] + dt * (A[1][0] * v[0] + A[1][1] * v[1])]; traces.push(v); }
  const W = 360, H = 200, X = (i: number) => 30 + ((i * dt) / T) * (W - 40), Y = (x: number) => 14 + (-Math.log10(Math.max(x, 1e-4)) / 4) * (H - 40);
  const line = (k: number) => traces.map((p, i) => (i % 5 === 0 ? `${X(i)},${Y(p[k])}` : "")).filter(Boolean).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="mx-auto w-full max-w-[460px] overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="Soma and dendrite voltages decaying on a log scale">
        {[1, 0.1, 0.01, 0.001].map((v) => <g key={v}><line x1="30" x2={W - 10} y1={Y(v)} y2={Y(v)} stroke="var(--line)" /><text x="26" y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text></g>)}
        <polyline points={line(0)} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <polyline points={line(1)} fill="none" stroke="var(--ai)" strokeWidth="2.5" />
        {[0, 40, 80, 120].map((t) => <text key={t} x={30 + (t / T) * (W - 40)} y={H - 10} fontSize="10" textAnchor={t === 120 ? "end" : "middle"} fill="var(--ink-3)">{t} ms</text>)}
        <text x="30" y={H + 8} fontSize="10" fill="var(--neuro)">soma (pulse injected here)</text>
        <text x="200" y={H + 8} fontSize="10" fill="var(--ai)">dendrite</text>
      </svg>
      <Slider label="coupling between soma and dendrite" value={g} min={0} max={3} step={0.05} onChange={setG} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fast mode time constant" value={`${(-1 / Math.min(...lam)).toFixed(1)} ms`} />
        <Stat label="slow mode time constant" value={`${(-1 / Math.max(...lam)).toFixed(1)} ms`} />
      </div>
      <p className="text-sm text-ink-2">Charge injected into the soma decays through the soma&apos;s own leak and also spreads into the dendrite. The two coupled linear equations have two eigenvalues, so the voltage is a sum of two exponentials. On a log scale each mode is a straight line: an early steep part (charge equalising between the compartments) and a late shallow part (the whole cell discharging). Rall used exactly this &quot;peeling&quot; of exponentials to measure neurons&apos; electrical structure.</p>
    </div>
  );
}
