"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const N = 24, T = 0.2;

/** Von Mises tuning curves on a circle and each neuron's Fisher information contribution T f'(θ)²/f(θ) at the chosen stimulus. */
export function FisherInfo() {
  const [th, setTh] = useState(20);
  const [kappa, setKappa] = useState(2);
  const pref = Array.from({ length: N }, (_, i) => -180 + (i * 360) / N);
  const rad = (d: number) => (d * Math.PI) / 180;
  const f = (x: number, p: number) => 1 + 20 * Math.exp(kappa * (Math.cos(rad(x - p)) - 1));
  const fp = (x: number, p: number) => -20 * kappa * Math.sin(rad(x - p)) * Math.exp(kappa * (Math.cos(rad(x - p)) - 1));
  const contrib = pref.map((p) => (T * fp(th, p) ** 2) / f(th, p));
  const I = contrib.reduce((a, b) => a + b, 0), cmax = Math.max(...contrib, 1e-9);
  const W = 360, sx = (d: number) => 10 + ((d + 180) / 360) * 340;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 230`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Tuning curves and Fisher information contributions">
        <text x="10" y="12" fontSize="9" fill="var(--ink-3)">tuning curves (rate against stimulus, -180° to 180°)</text>
        {pref.map((p, i) => (
          <polyline key={i} points={Array.from({ length: 73 }, (_, k) => { const x = -180 + k * 5; return `${sx(x)},${112 - f(x, p) * 4}`; }).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1" opacity={0.25 + 0.75 * (contrib[i] / cmax)} />
        ))}
        <line x1={sx(th)} x2={sx(th)} y1="16" y2="222" stroke="var(--ink)" strokeDasharray="3 3" />
        <text x="10" y="132" fontSize="9" fill="var(--ink-3)">contribution of each neuron, at its preferred stimulus</text>
        {pref.map((p, i) => <rect key={`b${i}`} x={sx(p) - 5} y={220 - (contrib[i] / cmax) * 76} width="10" height={(contrib[i] / cmax) * 76} fill="var(--ai)" />)}
      </svg>
      <Slider label="stimulus" value={th} min={-180} max={180} step={1} onChange={setTh} unit="°" />
      <Slider label="tuning sharpness κ" value={kappa} min={0.5} max={8} step={0.1} onChange={setKappa} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Fisher information (rad⁻²)" value={I.toFixed(1)} />
        <Stat label="Cramér-Rao bound" value={`${((180 / Math.PI) / Math.sqrt(I)).toFixed(1)}°`} />
      </div>
      <p className="text-sm text-ink-2">The bars sit at each neuron&apos;s preferred stimulus. The neuron right under the dashed line, firing hardest, contributes almost nothing; the two groups on the flanks, where the curves are steepest, carry the information. Sharpen the tuning and fewer neurons respond, but those that do have steeper slopes: with only 24 neurons, very sharp tuning leaves gaps between preferences and the bound depends on exactly where the stimulus falls.</p>
    </div>
  );
}
