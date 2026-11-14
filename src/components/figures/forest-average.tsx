"use client";

import React, { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";
import { grow, predict, type Pt, type Tree } from "./tree-lib";

/** Averaging many deep trees grown on bootstrap resamples, with a random feature at each split. */
export function ForestAverage() {
  const [m, setM] = useState(10);
  const { pts, test, trees } = useMemo(() => {
    const r = rng(583);
    const make = (n: number): Pt[] => Array.from({ length: n }, (): Pt => { const x = 2 * r() - 1, y = 2 * r() - 1; const c = (Math.sin(3 * x) * 0.5 > y ? 1 : 0) ^ (r() < 0.1 ? 1 : 0); return [x + 0.01 * gauss(r), y, c]; });
    const pts = make(200), test = make(1000);
    const trees: Tree[] = [];
    for (let k = 0; k < 100; k++) { const rr = rng(2000 + k); const bs = pts.map(() => pts[Math.floor(rr() * pts.length)]); trees.push(grow(bs, 10, rr, 1)); }
    return { pts, test, trees };
  }, []);
  const prob = (x: number, y: number): number => trees.slice(0, m).reduce((s, t) => s + predict(t, [x, y]), 0) / m;
  const acc = test.filter((p) => (prob(p[0], p[1]) > 0.5 ? 1 : 0) === p[2]).length / test.length;
  const single = test.filter((p) => (predict(trees[0], [p[0], p[1]]) > 0.5 ? 1 : 0) === p[2]).length / test.length;
  const cells: React.ReactElement[] = [];
  for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { const x = -1 + (i + 0.5) / 20, y = -1 + (j + 0.5) / 20, p = prob(x, y); cells.push(<rect key={`${i}-${j}`} x={30 + i * 4.5} y={185 - (j + 1) * 4.5} width="4.5" height="4.5" fill={p > 0.5 ? "var(--neuro)" : "var(--ai)"} opacity={0.1 + 0.6 * Math.abs(p - 0.5)} />); }
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 240 190" className="mx-auto w-full max-w-[380px] rounded-lg bg-surface-2" role="img" aria-label="Random forest probability map">
        {cells}
        {pts.map((p, i) => <circle key={i} cx={30 + (p[0] + 1) * 90} cy={185 - (p[1] + 1) * 90} r="1.8" fill={p[2] ? "var(--neuro)" : "var(--ai)"} />)}
      </svg>
      <Slider label="trees in the forest" value={m} min={1} max={100} step={1} onChange={setM} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="test accuracy, forest" value={acc.toFixed(3)} />
        <Stat label="test accuracy, one tree" value={single.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">One deep tree fits the noise in its resample and gives a ragged, overconfident map. Averaging trees smooths the map into probabilities and lifts test accuracy, with most of the gain in the first few dozen trees. The true boundary is a sine wave, and 10% of labels are flipped.</p>
    </div>
  );
}
