"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Pair-based exponential STDP window and its area A+τ+ − A−τ−. */
export function STDPWindow() {
  const [ap, setAp] = useState(0.5);
  const [am, setAm] = useState(0.65);
  const [tp, setTp] = useState(20);
  const [tm, setTm] = useState(20);
  const ds = Array.from({ length: 201 }, (_, i) => -100 + i);
  const f = (d: number) => (d > 0 ? ap * Math.exp(-d / tp) : d < 0 ? -am * Math.exp(d / tm) : 0);
  const area = ap * tp - am * tm, mx = Math.max(ap, am, 0.1);
  const W = 360, H = 190, sx = (d: number) => 20 + ((d + 100) / 200) * 320, sy = (v: number) => H / 2 - (v / mx) * (H / 2 - 18);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="STDP window">
        <line x1="20" x2="340" y1={H / 2} y2={H / 2} stroke="var(--line)" />
        <line x1={sx(0)} x2={sx(0)} y1="10" y2={H - 10} stroke="var(--line)" />
        <polygon points={`${sx(0.5)},${H / 2} ${ds.filter((d) => d > 0).map((d) => `${sx(d)},${sy(f(d))}`).join(" ")} ${sx(100)},${H / 2}`} fill="var(--ai-soft)" />
        <polygon points={`${sx(-100)},${H / 2} ${ds.filter((d) => d < 0).map((d) => `${sx(d)},${sy(f(d))}`).join(" ")} ${sx(-0.5)},${H / 2}`} fill="var(--neuro-soft)" />
        <polyline points={ds.filter((d) => d > 0).map((d) => `${sx(d)},${sy(f(d))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={ds.filter((d) => d < 0).map((d) => `${sx(d)},${sy(f(d))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <text x="22" y="16" fontSize="9" fill="var(--neuro)">post before pre: depression</text>
        <text x="338" y={H - 8} fontSize="9" textAnchor="end" fill="var(--ai)">pre before post: potentiation</text>
        <text x={sx(0) + 3} y={H - 8} fontSize="8" fill="var(--ink-3)">0 ms</text>
      </svg>
      <Slider label="potentiation amplitude A+" value={ap} min={0.1} max={1} step={0.05} onChange={setAp} fmt={(v) => v.toFixed(2)} />
      <Slider label="depression amplitude A−" value={am} min={0.1} max={1} step={0.05} onChange={setAm} fmt={(v) => v.toFixed(2)} />
      <Slider label="potentiation time constant τ+" value={tp} min={5} max={50} step={1} onChange={setTp} unit="ms" />
      <Slider label="depression time constant τ−" value={tm} min={5} max={50} step={1} onChange={setTm} unit="ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="window area" value={area.toFixed(1)} />
        <Stat label="random pairings cause" value={area < 0 ? "net depression" : area > 0 ? "net potentiation" : "no change"} />
      </div>
      <p className="text-sm text-ink-2">The horizontal axis is the postsynaptic spike time minus the presynaptic one, from -100 to 100 ms. Amplitudes are in arbitrary units. The shaded areas decide what happens to a synapse whose input is unrelated to the neuron&apos;s firing: if the depression lobe is larger, such synapses weaken, and only inputs that help cause spikes are kept.</p>
    </div>
  );
}
