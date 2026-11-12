"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const SC = 0.25, SS = 1.0;

/** Difference-of-Gaussians receptive field (σc = 0.25°, σs = 1°): its radial profile, a centred spot, and the area-response curve. */
export function RetinaDoG() {
  const [d, setD] = useState(1.2);
  const [w, setW] = useState(0.85);
  // response to a centred disc of diameter D: integral of each normalised 2D Gaussian over the disc = 1 - exp(-R²/2σ²)
  const resp = (D: number) => (1 - Math.exp(-((D / 2) ** 2) / (2 * SC * SC))) - w * (1 - Math.exp(-((D / 2) ** 2) / (2 * SS * SS)));
  const diams = Array.from({ length: 81 }, (_, i) => i * 0.1);
  const rs = diams.map(resp), rmax = Math.max(...rs), best = diams[rs.indexOf(rmax)];
  const prof = (x: number) => Math.exp(-(x * x) / (2 * SC * SC)) / (SC * SC) - w * Math.exp(-(x * x) / (2 * SS * SS)) / (SS * SS);
  const W = 360, px = (x: number) => 95 + (x / 4) * 85, pmax = prof(0);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 200`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Receptive field profile, spot and area-response curve">
        <text x="10" y="14" fontSize="9" fill="var(--ink-3)">receptive field and spot (±4°)</text>
        <circle cx="95" cy="105" r={SS * 2 * 21} fill="var(--neuro-soft)" />
        <circle cx="95" cy="105" r={SC * 2 * 21} fill="var(--ai-soft)" stroke="var(--ai)" />
        <circle cx="95" cy="105" r={(d / 2) * 21} fill="#ffd27a" opacity="0.55" stroke="#c99400" />
        <polyline points={Array.from({ length: 81 }, (_, i) => { const x = -4 + i * 0.1; return `${px(x)},${180 - (prof(x) / pmax) * 22}`; }).join(" ")} fill="none" stroke="var(--ink-2)" strokeWidth="1" />
        <line x1="10" x2="180" y1="180" y2="180" stroke="var(--line)" />
        <text x="200" y="14" fontSize="9" fill="var(--ink-3)">response against spot diameter (0 to 8°)</text>
        <line x1="200" x2="350" y1="170" y2="170" stroke="var(--line)" />
        <polyline points={rs.map((r, i) => `${200 + (diams[i] / 8) * 150},${170 - (r / rmax) * 140}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <circle cx={200 + (d / 8) * 150} cy={170 - (resp(d) / rmax) * 140} r="4" fill="#c99400" />
      </svg>
      <Slider label="spot diameter" value={d} min={0.1} max={8} step={0.1} onChange={setD} unit="°" fmt={(v) => v.toFixed(1)} />
      <Slider label="surround weight w" value={w} min={0} max={1} step={0.01} onChange={setW} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="response" value={resp(d).toFixed(2)} />
        <Stat label="best spot" value={`${best.toFixed(1)}°`} />
        <Stat label="full field / best" value={`${Math.round((resp(8) / rmax) * 100)}%`} />
      </div>
      <p className="text-sm text-ink-2">Blue is the excitatory centre, pink the inhibitory surround, yellow the spot. Small spots excite only part of the centre; a spot that just fills it gives the best response; larger spots spill into the surround and the response falls. With no surround (w = 0) the curve simply rises and saturates; with w = 1 a full field gives no response at all.</p>
    </div>
  );
}
