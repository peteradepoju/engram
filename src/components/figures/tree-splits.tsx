"use client";

import React, { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";
import { countLeaves, grow, predict, type Pt } from "./tree-lib";

/** A classification tree splits the plane into rectangles, one question at a time. */
export function TreeSplits() {
  const [depth, setDepth] = useState(2);
  const pts = useMemo(() => { const r = rng(581); return Array.from({ length: 160 }, (): Pt => { const x = 2 * r() - 1, y = 2 * r() - 1; const c = (x * x + 0.6 * y < 0.35 ? 1 : 0) ^ (r() < 0.08 ? 1 : 0); return [x + 0.02 * gauss(r), y, c]; }); }, []);
  const tree = useMemo(() => grow(pts, depth), [pts, depth]);
  const cells: React.ReactElement[] = [];
  for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { const x = -1 + (i + 0.5) / 20, y = -1 + (j + 0.5) / 20; const p = predict(tree, [x, y]); cells.push(<rect key={`${i}-${j}`} x={30 + i * 4.5} y={185 - (j + 1) * 4.5} width="4.5" height="4.5" fill={p > 0.5 ? "var(--neuro)" : "var(--ai)"} opacity={0.12 + 0.3 * Math.abs(p - 0.5) * 2} />); }
  const err = pts.filter((p) => (predict(tree, [p[0], p[1]]) > 0.5 ? 1 : 0) !== p[2]).length;
  const sx = (v: number): number => 30 + (v + 1) * 90, sy = (v: number): number => 185 - (v + 1) * 90;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 240 190" className="mx-auto w-full max-w-[380px] rounded-lg bg-surface-2" role="img" aria-label="Tree partition of the plane">
        {cells}
        {pts.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="2.2" fill={p[2] ? "var(--neuro)" : "var(--ai)"} />)}
      </svg>
      <Slider label="maximum depth" value={depth} min={1} max={8} step={1} onChange={setDepth} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="leaves" value={String(countLeaves(tree))} />
        <Stat label="training errors (of 160)" value={String(err)} />
      </div>
      <p className="text-sm text-ink-2">Each split asks whether one feature is above a threshold, so the regions are rectangles. Deeper trees approximate the curved boundary with more, smaller rectangles, and eventually carve out single noisy points: 8% of the labels here were flipped at random.</p>
    </div>
  );
}
