"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Spike phases on a circle, with PLV and PPC for a chosen number of spikes and locking strength. */
export function PhaseLocking() {
  const [n, setN] = useState(10);
  const [kappa, setKappa] = useState(0);
  const ph = useMemo(() => {
    const r = rng(2010);
    const draw = () => {
      if (kappa === 0) return -Math.PI + 2 * Math.PI * r();
      for (;;) { const x = -Math.PI + 2 * Math.PI * r(); if (r() < Math.exp(kappa * (Math.cos(x) - 1))) return x; }
    };
    return Array.from({ length: n }, draw);
  }, [n, kappa]);
  let cx = 0, cy = 0; ph.forEach((p) => { cx += Math.cos(p); cy += Math.sin(p); });
  const plv = Math.hypot(cx, cy) / n, ppc = n > 1 ? (cx * cx + cy * cy - n) / (n * (n - 1)) : 0;
  const R = 70, ox = 100, oy = 90;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Spike phases and phase-locking measures">
        <circle cx={ox} cy={oy} r={R} fill="none" stroke="var(--line)" />
        {ph.slice(0, 300).map((p, i) => <line key={i} x1={ox} y1={oy} x2={ox + R * Math.cos(p)} y2={oy - R * Math.sin(p)} stroke="var(--neuro)" strokeWidth="0.6" opacity="0.5" />)}
        <line x1={ox} y1={oy} x2={ox + R * (cx / n)} y2={oy - R * (cy / n)} stroke="var(--ink)" strokeWidth="2.5" />
        <text x={ox} y="176" fontSize="8" textAnchor="middle" fill="var(--ink-3)">black arrow: mean resultant (PLV)</text>
        <rect x="220" y={150 - plv * 120} width="30" height={plv * 120} fill="var(--neuro)" />
        <rect x="280" y={150 - Math.max(0, ppc) * 120} width="30" height={Math.max(0, ppc) * 120} fill="var(--ai)" />
        <line x1="210" x2="320" y1="150" y2="150" stroke="var(--line)" />
        <text x="235" y="164" fontSize="8" textAnchor="middle" fill="var(--neuro)">PLV</text>
        <text x="295" y="164" fontSize="8" textAnchor="middle" fill="var(--ai)">PPC</text>
      </svg>
      <Slider label="number of spikes" value={n} min={2} max={1000} step={1} onChange={setN} />
      <Slider label="locking strength κ" value={kappa} min={0} max={3} step={0.1} onChange={setKappa} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="PLV" value={plv.toFixed(3)} />
        <Stat label="PPC" value={ppc.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">With κ = 0 the spikes are unlocked: the PLV is large for a handful of spikes and shrinks only slowly, while the PPC hovers around zero. With locking, the PPC settles near the square of the PLV once there are enough spikes.</p>
    </div>
  );
}
