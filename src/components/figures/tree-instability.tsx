"use client";

import React, { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";
import { grow, predict, type Pt } from "./tree-lib";

/** Trees grown on bootstrap resamples of the same data can look very different. */
export function TreeInstability() {
  const [b, setB] = useState(1);
  const [depth, setDepth] = useState(5);
  const pts = useMemo(() => { const r = rng(582); return Array.from({ length: 120 }, (): Pt => { const x = gauss(r), y = gauss(r); return [x, y, x + 0.8 * y + 0.7 * gauss(r) > 0 ? 1 : 0]; }); }, []);
  const resample = (k: number): Pt[] => { if (k === 0) return pts; const r = rng(1000 + k); return pts.map(() => pts[Math.floor(r() * pts.length)]); };
  const t0 = useMemo(() => grow(resample(0), depth), [pts, depth]);
  const tb = useMemo(() => grow(resample(b), depth), [pts, depth, b]);
  let agree = 0, tot = 0;
  const cells: React.ReactElement[] = [];
  for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) {
    const x = -2.5 + (i + 0.5) / 8, y = -2.5 + (j + 0.5) / 8, p = predict(tb, [x, y]) > 0.5, q = predict(t0, [x, y]) > 0.5;
    tot++; if (p === q) agree++;
    cells.push(<rect key={`${i}-${j}`} x={30 + i * 4.5} y={185 - (j + 1) * 4.5} width="4.5" height="4.5" fill={p ? "var(--neuro)" : "var(--ai)"} opacity={p === q ? 0.2 : 0.55} />);
  }
  const root = (t: ReturnType<typeof grow>): string => (t.leaf ? "leaf" : `x${t.j + 1} ≤ ${t.t.toFixed(2)}`);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 240 190" className="mx-auto w-full max-w-[380px] rounded-lg bg-surface-2" role="img" aria-label="A tree from a bootstrap resample">
        {cells}
        <line x1={30 + 2.5 * 36} x2={30 + 2.5 * 36} y1="5" y2="185" stroke="var(--line)" />
      </svg>
      <Slider label="bootstrap resample" value={b} min={1} max={20} step={1} onChange={setB} />
      <Slider label="maximum depth" value={depth} min={1} max={8} step={1} onChange={setDepth} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="root split, original data" value={root(t0)} />
        <Stat label="root split, this resample" value={root(tb)} />
        <Stat label="agreement over the plane" value={`${((100 * agree) / tot).toFixed(0)}%`} />
      </div>
      <p className="text-sm text-ink-2">Each resample draws the same 120 trials with replacement. Shading shows the resampled tree's decisions; stronger colour marks where it disagrees with the tree grown on the original data. Deep trees disagree over large regions: small changes in the data change the early splits, and everything below them.</p>
    </div>
  );
}
