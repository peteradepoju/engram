"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { Stat } from "./util";

/** Spike amplitude on the sites of a linear probe falls steeply with distance from the neuron. Drag the neurons. */
export function ElectrodeArray() {
  const [n1, setN1] = useState({ x: 40, y: 90 });
  const [n2, setN2] = useState({ x: -55, y: 170 });
  const W = 360, H = 260, px = 120, sites = Array.from({ length: 16 }, (_, i) => 20 + i * 14);
  const drag = useSvgDrag((k, x, y) => { const p = { x: Math.max(-100, Math.min(100, x - px)), y: Math.max(15, Math.min(H - 15, y)) }; (k === "a" ? setN1 : setN2)(p); });
  const amp = (n: { x: number; y: number }, sy: number) => { const r = Math.hypot(n.x, n.y - sy) / 20 + 0.6; return 1 / (r * r); };
  const a1 = sites.map((s) => amp(n1, s)), a2 = sites.map((s) => amp(n2, s)), mx = Math.max(...a1, ...a2);
  return (
    <div className="space-y-3">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Two neurons near a linear electrode array and the spike amplitude on each site">
        <rect x={px - 6} y="10" width="12" height={H - 20} rx="3" fill="var(--surface)" stroke="var(--line)" />
        {sites.map((s, i) => <rect key={i} x={px - 3} y={s - 3} width="6" height="6" fill="var(--ink-3)" />)}
        {[{ n: n1, k: "a", c: "var(--neuro)" }, { n: n2, k: "b", c: "var(--ai)" }].map(({ n, k, c }) => (
          <g key={k}><polygon points={`${px + n.x},${n.y - 9} ${px + n.x - 7},${n.y + 6} ${px + n.x + 7},${n.y + 6}`} fill={c} {...drag.handle(k)} /></g>
        ))}
        {sites.map((s, i) => (
          <g key={i}>
            <rect x="240" y={s - 4} width={(a1[i] / mx) * 55} height="4" fill="var(--neuro)" />
            <rect x="240" y={s} width={(a2[i] / mx) * 55} height="4" fill="var(--ai)" />
          </g>
        ))}
        <text x="240" y={H - 4} fontSize="9" fill="var(--ink-3)">spike size on each site</text>
        <text x="10" y={H - 4} fontSize="9" fill="var(--ink-3)">drag the neurons</text>
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="pink neuron: peak site" value={`${a1.indexOf(Math.max(...a1)) + 1} of 16`} />
        <Stat label="blue neuron: peak site" value={`${a2.indexOf(Math.max(...a2)) + 1} of 16`} />
      </div>
      <p className="text-sm text-ink-2">An extracellular spike is a tiny voltage that falls off steeply with distance (roughly as the inverse square for a dipole-like source), so each neuron appears on only a few neighbouring sites, largest on the closest. That spatial footprint is what spike sorting uses to tell neurons apart: two neurons at the same depth but on opposite sides look alike on one site but differ across several, and dense probes such as Neuropixels exploit this with hundreds of closely spaced sites.</p>
    </div>
  );
}
