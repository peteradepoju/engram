"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider } from "./util";
import { tsne } from "./tsne-lib";

const COLS = ["var(--neuro)", "var(--ai)", "var(--warn)", "var(--good)"];

/** t-SNE of four clusters in ten dimensions, one of which is twice as wide and far from the others, at a chosen perplexity. */
export function TsnePerplexity() {
  const [perp, setPerp] = useState(30);
  const [seed, setSeed] = useState(1);
  const data = useMemo(() => {
    const r = rng(614), centres = [0, 1, 2, 3].map((k) => Array.from({ length: 10 }, (_, d) => (d === k ? (k === 3 ? 30 : 8) : 0)));
    const lab: number[] = [], X: number[][] = [];
    for (let k = 0; k < 4; k++) for (let i = 0; i < 40; i++) { lab.push(k); X.push(centres[k].map((c) => c + (k === 0 ? 2 : 1) * gauss(r))); }
    return { X, lab };
  }, []);
  const Y = useMemo(() => tsne(data.X, perp, 350, seed), [data, perp, seed]);
  const xs = Y.map((y) => y[0]), ys = Y.map((y) => y[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.max(x1 - x0, y1 - y0) || 1;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 200" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="t-SNE embedding">
        {Y.map((y, i) => <circle key={i} cx={170 + ((y[0] - (x0 + x1) / 2) / s) * 180} cy={100 + ((y[1] - (y0 + y1) / 2) / s) * 180} r="2.6" fill={COLS[data.lab[i]]} opacity="0.85" />)}
      </svg>
      <Slider label="perplexity" value={perp} min={2} max={60} step={1} onChange={setPerp} />
      <Slider label="random start" value={seed} min={1} max={6} step={1} onChange={setSeed} />
      <p className="text-sm text-ink-2">In ten dimensions, the pink cluster is twice as spread as the others and the green one is three times farther away. t-SNE preserves who is near whom, so the clusters separate, but it equalises their sizes and does not preserve the distances between them. Very low perplexity breaks clusters into fragments; changing the random start moves them about.</p>
    </div>
  );
}
