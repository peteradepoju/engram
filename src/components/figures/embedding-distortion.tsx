"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";
import { tsne } from "./tsne-lib";

/** A continuous trajectory and how a neighbour embedding can break it into apparent clusters. */
export function EmbeddingDistortion() {
  const [gaps, setGaps] = useState(0);
  const res = useMemo(() => {
    const r = rng(615), n = 150;
    const t = Array.from({ length: n }, (_, i) => i / (n - 1));
    const X = t.map((u) => { const shift = gaps * Math.floor(u * 3) / 2; return [Math.cos(3 * (u + shift)) * 3, Math.sin(3 * (u + shift)) * 3, 4 * u, ...Array.from({ length: 5 }, () => 0.15 * gauss(r))].map((v, k) => v + (k < 3 ? 0.05 * gauss(r) : 0)); });
    const Y = tsne(X, 10, 350, 2);
    const step = (A: number[][]): number[] => A.slice(1).map((a, i) => Math.hypot(...a.map((v, k) => v - A[i][k])));
    const sx = step(X), sy = step(Y);
    const ratio = (s: number[]): number => Math.max(...s) / (s.slice().sort((a, b) => a - b)[Math.floor(s.length / 2)]);
    return { Y, t, rx: ratio(sx), ry: ratio(sy) };
  }, [gaps]);
  const xs = res.Y.map((y) => y[0]), ys = res.Y.map((y) => y[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.max(x1 - x0, y1 - y0) || 1;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 200" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Embedding of a trajectory">
        {res.Y.map((y, i) => <circle key={i} cx={170 + ((y[0] - (x0 + x1) / 2) / s) * 180} cy={100 + ((y[1] - (y0 + y1) / 2) / s) * 180} r="2.6" fill={`hsl(${200 + 140 * res.t[i]} 70% 60%)`} />)}
      </svg>
      <Slider label="size of the jumps in the true trajectory" value={gaps} min={0} max={0.6} step={0.02} onChange={setGaps} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="largest step / median step, original" value={res.rx.toFixed(1)} />
        <Stat label="largest step / median step, t-SNE" value={res.ry.toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">A smooth trajectory of population activity, coloured by time. With no jumps the trajectory is continuous, yet the embedding may break it into pieces, because t-SNE with small perplexity attends only to local neighbourhoods. Add real jumps and they are exaggerated. The gaps in an embedding are not evidence of gaps in the data.</p>
    </div>
  );
}
