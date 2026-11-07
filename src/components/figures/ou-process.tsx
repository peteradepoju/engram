"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The Ornstein-Uhlenbeck process dx = −x/τ dt + σ dW against a random walk with the same noise. */
export function OUProcess() {
  const [tau, setTau] = useState(10);
  const [sigma, setSigma] = useState(1);
  const dt = 0.1, n = 3000;
  const { ou, rw, sd } = useMemo(() => {
    const r = rng(1930), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    let x = 0, y = 0; const ou: number[] = [], rw: number[] = [];
    for (let k = 0; k < n; k++) { const e = g() * sigma * Math.sqrt(dt); x += (-x / tau) * dt + e; y += e; ou.push(x); rw.push(y); }
    const tail = ou.slice(500), m = tail.reduce((a, b) => a + b, 0) / tail.length;
    return { ou, rw, sd: Math.sqrt(tail.reduce((a, b) => a + (b - m) ** 2, 0) / tail.length) };
  }, [tau, sigma]);
  const theory = sigma * Math.sqrt(tau / 2);
  const top = Math.max(4 * theory, ...rw.map(Math.abs)) * 1.05;
  const W = 360, H = 200, X = (k: number) => 20 + (k / n) * (W - 30), Y = (v: number) => H / 2 - (v / top) * (H / 2 - 14);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="An Ornstein-Uhlenbeck process and a random walk driven by the same noise">
        <rect x="20" y={Y(2 * theory)} width={W - 30} height={Y(-2 * theory) - Y(2 * theory)} fill="var(--ai)" opacity="0.08" />
        <line x1="20" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <polyline points={rw.filter((_, k) => k % 3 === 0).map((v, k) => `${X(k * 3)},${Y(v)}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1" />
        <polyline points={ou.filter((_, k) => k % 3 === 0).map((v, k) => `${X(k * 3)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.3" />
        <text x="24" y="14" fontSize="9" fill="var(--neuro)">Ornstein-Uhlenbeck</text>
        <text x="24" y="26" fontSize="9" fill="var(--ink-3)">random walk, same noise</text>
        <text x={W - 12} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">300 time units · band: ±2 stationary sd</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="time constant τ" value={tau} min={1} max={60} step={1} onChange={setTau} />
        <Slider label="noise σ" value={sigma} min={0.2} max={2} step={0.05} onChange={setSigma} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="measured sd" value={sd.toFixed(2)} />
        <Stat label="theory σ√(τ/2)" value={theory.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Add a leak to a random walk and you get the Ornstein-Uhlenbeck process, the noisy membrane equation. The random walk wanders ever further, but the leak pulls the OU process back towards zero, so its spread settles at σ√(τ/2) and its memory of the past fades over about τ. It is the standard model of a neuron's fluctuating voltage under many synaptic inputs.</p>
    </div>
  );
}
