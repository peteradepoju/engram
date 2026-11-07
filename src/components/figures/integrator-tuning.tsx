"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A recurrent unit τ dr/dt = −r + w r + input, given three brief pulses. Tuned (w = 1) it integrates; mistuned it leaks or runs away. */
export function IntegratorTuning() {
  const [w, setW] = useState(0.97);
  const tau = 20, dt = 1, T = 3000;
  const pulse = (t: number) => ((t >= 200 && t < 250) || (t >= 1000 && t < 1050) || (t >= 1800 && t < 1850) ? 1 : 0);
  const r: number[] = []; let x = 0;
  for (let t = 0; t < T; t += dt) { r.push(x); x += (dt / tau) * (-x + w * x + pulse(t)); }
  const ideal: number[] = []; let y = 0;
  for (let t = 0; t < T; t += dt) { ideal.push(y); y += (dt / tau) * pulse(t); }
  const top = Math.max(8, ...ideal) * 1.15;
  const W = 360, H = 200, X = (t: number) => 30 + (t / T) * (W - 40), Y = (v: number) => H - 26 - (Math.max(-top * 0.05, Math.min(v, top)) / top) * (H - 40);
  const teff = w < 1 ? tau / (1 - w) : Infinity;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Rate of a recurrent unit after three input pulses">
        <line x1="30" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        {[200, 1000, 1800].map((t) => <rect key={t} x={X(t)} y={H - 24} width={Math.max(2, X(t + 50) - X(t))} height="6" fill="var(--warn)" />)}
        <polyline points={ideal.filter((_, k) => k % 10 === 0).map((v, k) => `${X(k * 10)},${Y(v)}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="4 3" />
        <polyline points={r.filter((_, k) => k % 10 === 0).map((v, k) => `${X(k * 10)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        {[0, 1, 2, 3].map((s) => <text key={s} x={X(s * 1000)} y={H - 8} fontSize="10" textAnchor={s === 3 ? "end" : "middle"} fill="var(--ink-3)">{s} s</text>)}
        <text x="34" y="20" fontSize="10" fill="var(--neuro)">rate r</text>
        <text x="34" y="34" fontSize="10" fill="var(--ink-3)">dashed: perfect integrator</text>
      </svg>
      <Slider label="recurrent weight w" value={w} min={0.8} max={1.02} step={0.002} onChange={setW} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="effective time constant" value={w < 1 ? `${(teff / 1000).toFixed(2)} s` : w === 1 ? "infinite" : "unstable"} />
        <Stat label="rate at 3 s" value={r[r.length - 1].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">A single neuron forgets its input in about τ = 20 ms. Feed its output back with weight w and the eigenvalue of the loop becomes (w − 1)/τ, so the memory lasts τ/(1 − w). At w = 1 the eigenvalue is zero and the unit adds up its inputs and holds the total: an integrator, like the brainstem circuit that holds the eyes still. A mistuning of a few per cent in either direction makes it leak or run away.</p>
    </div>
  );
}
