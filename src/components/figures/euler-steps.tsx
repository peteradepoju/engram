"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Euler and fourth-order Runge-Kutta on dV/dt = −V/τ, compared with the exact solution, for a chosen step size. */
export function EulerSteps() {
  const [dt, setDt] = useState(4);
  const tau = 10, T = 60, V0 = 1;
  const f = (v: number) => -v / tau;
  const euler: number[][] = [[0, V0]], rk4: number[][] = [[0, V0]];
  let ve = V0, vr = V0;
  for (let t = dt; t <= T + 1e-9; t += dt) {
    ve = ve + dt * f(ve);
    const k1 = f(vr), k2 = f(vr + dt * k1 / 2), k3 = f(vr + dt * k2 / 2), k4 = f(vr + dt * k3);
    vr = vr + dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    euler.push([t, ve]); rk4.push([t, vr]);
  }
  const W = 360, H = 200, X = (t: number) => 30 + (t / T) * (W - 40), Y = (v: number) => H / 2 - Math.max(-1.6, Math.min(1.6, v)) * (H / 2 - 16);
  const exact = Array.from({ length: 121 }, (_, i) => { const t = (i / 120) * T; return `${X(t)},${Y(Math.exp(-t / tau))}`; }).join(" ");
  const errE = Math.abs(euler[euler.length - 1][1] - Math.exp(-euler[euler.length - 1][0] / tau)), errR = Math.abs(rk4[rk4.length - 1][1] - Math.exp(-rk4[rk4.length - 1][0] / tau));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="mx-auto w-full max-w-[460px] overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="Euler and Runge-Kutta solutions against the exact decay">
        <line x1="30" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <polyline points={exact} fill="none" stroke="var(--good)" strokeWidth="2.5" />
        <polyline points={euler.map(([t, v]) => `${X(t)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        {euler.map(([t, v], i) => <circle key={i} cx={X(t)} cy={Y(v)} r="3" fill="var(--neuro)" />)}
        <polyline points={rk4.map(([t, v]) => `${X(t)},${Y(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="4 3" />
        {rk4.map(([t, v], i) => <rect key={i} x={X(t) - 2.5} y={Y(v) - 2.5} width="5" height="5" fill="var(--ai)" />)}
        <text x="30" y={H + 8} fontSize="10" fill="var(--good)">exact e^(−t/τ)</text>
        <text x="120" y={H + 8} fontSize="10" fill="var(--neuro)">Euler</text>
        <text x="170" y={H + 8} fontSize="10" fill="var(--ai)">Runge-Kutta 4</text>
      </svg>
      <Slider label="step size Δt (τ = 10 ms)" value={dt} min={0.5} max={25} step={0.5} onChange={setDt} unit="ms" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Δt / τ" value={(dt / tau).toFixed(2)} />
        <Stat label="Euler error at the end" value={errE.toExponential(1)} />
        <Stat label="RK4 error at the end" value={errR.toExponential(1)} />
      </div>
      <p className="text-sm text-ink-2">Euler&apos;s method takes a step along the current slope: V ← V + Δt f(V). For this decay each step multiplies V by 1 − Δt/τ. With small steps it tracks the exact curve; above Δt = τ it overshoots below zero, and above 2τ it oscillates with growing amplitude: numerical instability. Fourth-order Runge-Kutta samples the slope four times per step and stays accurate with steps many times larger.</p>
    </div>
  );
}
