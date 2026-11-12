"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Normalised response to a preferred grating of contrast c, with an orthogonal mask of contrast m in the pool: R = c² / (c50² + c² + m²). */
export function DivisiveNormalization() {
  const [mask, setMask] = useState(0.3);
  const [c50, setC50] = useState(0.2);
  const R = (c: number, m: number) => (c * c) / (c50 * c50 + c * c + m * m);
  const cs = Array.from({ length: 61 }, (_, i) => 10 ** (-2 + (i / 60) * 2));
  const W = 360, H = 200, sx = (c: number) => 30 + ((Math.log10(c) + 2) / 2) * 310, sy = (v: number) => H - 25 - v * (H - 45);
  const half = (m: number) => Math.sqrt(c50 * c50 + m * m);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Contrast response with and without a mask">
        <line x1="30" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <polyline points={cs.map((c) => `${sx(c)},${sy(R(c, 0))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={cs.map((c) => `${sx(c)},${sy(R(c, mask))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" strokeDasharray="5 3" />
        {[0.01, 0.1, 1].map((c) => <text key={c} x={sx(c)} y={H - 8} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{c * 100}%</text>)}
        <text x="36" y="16" fontSize="9" fill="var(--ai)">preferred grating alone</text>
        <text x="36" y="30" fontSize="9" fill="var(--neuro)">with orthogonal mask</text>
      </svg>
      <Slider label="mask contrast" value={mask} min={0} max={1} step={0.01} onChange={setMask} fmt={(v) => `${Math.round(v * 100)}%`} />
      <Slider label="semi-saturation contrast c50" value={c50} min={0.02} max={0.6} step={0.01} onChange={setC50} fmt={(v) => `${Math.round(v * 100)}%`} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="half response, alone" value={`${Math.round(half(0) * 100)}%`} />
        <Stat label="with mask" value={`${Math.round(half(mask) * 100)}%`} />
        <Stat label="response at 50%, with mask" value={`${Math.round((R(0.5, mask) / R(0.5, 0)) * 100)}% of alone`} />
      </div>
      <p className="text-sm text-ink-2">The horizontal axis is logarithmic. Without a mask the response follows a Naka-Rushton curve that saturates above c50. The mask, which drives nothing on its own, adds to the denominator: the curve shifts to the right, so the same grating needs more contrast to give the same response. Because the mask is divided out rather than subtracted, the whole curve slides sideways by a constant factor on the logarithmic axis, keeping its shape and maximum.</p>
    </div>
  );
}
