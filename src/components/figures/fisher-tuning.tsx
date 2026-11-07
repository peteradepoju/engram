"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Fisher information of Poisson neurons: each neuron is most informative on the flanks of its tuning curve, not at its peak. */
export function FisherTuning() {
  const [N, setN] = useState(8);
  const [width, setWidth] = useState(20);
  const [theta, setTheta] = useState(70);
  const prefs = Array.from({ length: N }, (_, i) => (i * 180) / N);
  const circ = (d: number) => { const x = ((d % 180) + 270) % 180 - 90; return x; };
  const f = (t: number, p: number) => 1 + 20 * Math.exp(-(circ(t - p) ** 2) / (2 * width * width));
  const fp = (t: number, p: number) => (f(t + 0.01, p) - f(t - 0.01, p)) / 0.02;
  const fi = (t: number, p: number) => fp(t, p) ** 2 / f(t, p);
  const total = (t: number) => prefs.reduce((s, p) => s + fi(t, p), 0);
  const W = 360, H = 230, HH = 262, X = (t: number) => 26 + (t / 180) * (W - 36);
  const ts = Array.from({ length: 181 }, (_, i) => i);
  const fmax = 21, fiMax = Math.max(...ts.map(total)) * 1.1;
  const Yf = (v: number) => 104 - (v / fmax) * 90, Yi = (v: number) => H - 26 - (v / fiMax) * 90;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${HH}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Tuning curves and Fisher information">
        {prefs.map((p, i) => <polyline key={i} points={ts.map((t) => `${X(t)},${Yf(f(t, p))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" opacity="0.7" />)}
        <polyline points={ts.map((t) => `${X(t)},${Yi(total(t))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        {prefs.map((p, i) => <polyline key={`i${i}`} points={ts.map((t) => `${X(t)},${Yi(fi(t, p))}`).join(" ")} fill="none" stroke="var(--warn)" strokeWidth="1" opacity="0.6" />)}
        <line x1={X(theta)} x2={X(theta)} y1="10" y2={H - 26} stroke="var(--good)" strokeDasharray="4 3" />
        <line x1="26" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[0, 45, 90, 135, 180].map((t) => <text key={t} x={X(t)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{t}°</text>)}
        <text x={W - 10} y="14" fontSize="10" textAnchor="end" fill="var(--ai)">tuning curves</text>
        <text x="26" y={H + 8} fontSize="10" fill="var(--warn)">each neuron&apos;s Fisher information</text>
        <text x="210" y={H + 8} fontSize="10" fill="var(--neuro)">population total</text>
        <text x="26" y={H + 24} fontSize="10" fill="var(--good)">dashed: the stimulus θ</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="neurons" value={N} min={2} max={32} step={1} onChange={setN} />
        <Slider label="tuning width" value={width} min={6} max={60} step={1} onChange={setWidth} unit="°" />
        <Slider label="stimulus θ" value={theta} min={0} max={180} step={1} onChange={setTheta} unit="°" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="population Fisher information at θ" value={total(theta).toFixed(2)} />
        <Stat label="best possible sd of an unbiased estimate" value={`${(1 / Math.sqrt(total(theta))).toFixed(2)}°`} />
      </div>
      <p className="text-sm text-ink-2">For a Poisson neuron, the Fisher information about the stimulus is f′(θ)²/f(θ): the squared slope of its tuning curve over its rate. It is zero at the peak, where a small change in θ hardly changes the rate, and largest on the flanks. Summed over a population that tiles orientation, it is nearly flat. By the Cramér-Rao bound, no unbiased decoder can have a standard deviation below one over its square root.</p>
    </div>
  );
}
