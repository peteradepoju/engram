"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** A grid map as a sum of three plane waves, with an option to break the 60-degree symmetry. */
export function GridCell() {
  const [lam, setLam] = useState(0.3);
  const [ori, setOri] = useState(0);
  const [skew, setSkew] = useState(60);
  const [px, setPx] = useState(0);
  const nb = 60;
  const cells = useMemo(() => {
    const k = (4 * Math.PI) / (Math.sqrt(3) * lam), o = (ori * Math.PI) / 180, sk = (skew * Math.PI) / 180;
    const angs = [o, o + sk, o + 2 * sk];
    const out: number[] = [];
    for (let i = 0; i < nb; i++) for (let j = 0; j < nb; j++) {
      const x = (i + 0.5) / nb - px, y = (j + 0.5) / nb;
      let s = 0;
      for (const a of angs) s += Math.cos(k * (Math.cos(a) * x + Math.sin(a) * y));
      out.push(Math.max(0, (s + 1.5) / 4.5));
    }
    return out;
  }, [lam, ori, skew, px]);
  const S = 200, c = S / nb;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 220" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Grid cell rate map">
        {cells.map((v, n) => (
          <rect key={n} x={80 + Math.floor(n / nb) * c} y={10 + (nb - 1 - (n % nb)) * c} width={c + 0.15} height={c + 0.15} fill="var(--neuro)" opacity={0.05 + 0.95 * v} />
        ))}
        <rect x="80" y="10" width={S} height={S} fill="none" stroke="var(--line)" />
        <text x="76" y="214" fontSize="8" textAnchor="end" fill="var(--ink-3)">0</text>
        <text x="280" y="218" fontSize="8" textAnchor="end" fill="var(--ink-3)">1 m</text>
      </svg>
      <Slider label="spacing" value={lam} min={0.15} max={0.8} step={0.01} onChange={setLam} unit="m" />
      <Slider label="orientation" value={ori} min={0} max={60} step={1} onChange={setOri} unit="°" />
      <Slider label="phase (shift in x)" value={px} min={0} max={0.5} step={0.01} onChange={setPx} unit="m" />
      <Slider label="angle between waves" value={skew} min={30} max={90} step={1} onChange={setSkew} unit="°" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fields across 1 m" value={(1 / lam).toFixed(1)} />
        <Stat label="symmetry" value={skew === 60 ? "hexagonal" : "broken"} />
      </div>
      <p className="text-sm text-ink-2">Only when the three waves are 60 degrees apart do the peaks form a regular triangular lattice. Changing the phase slides the whole lattice, which is how neighbouring grid cells in one module differ.</p>
    </div>
  );
}
