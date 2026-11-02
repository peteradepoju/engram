"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Stochastic gradient descent for a two-weight linear neuron: smaller minibatches give noisier paths. */
export function SgdPaths() {
  const [batch, setBatch] = useState(4);
  const [lr, setLr] = useState(0.1);
  const [seed, setSeed] = useState(1);
  const data = useMemo(() => {
    const r = rng(51), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 200 }, () => { const x1 = g(), x2 = 0.6 * x1 + 0.8 * g(); return [x1, x2, 1.0 * x1 - 0.5 * x2 + 0.5 * g()]; });
  }, []);
  const A = [[0, 0], [0, 0]], bv = [0, 0];
  data.forEach(([x1, x2, y]) => { A[0][0] += x1 * x1 / 200; A[0][1] += x1 * x2 / 200; A[1][1] += x2 * x2 / 200; bv[0] += x1 * y / 200; bv[1] += x2 * y / 200; });
  A[1][0] = A[0][1];
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const wStar = [(A[1][1] * bv[0] - A[0][1] * bv[1]) / det, (-A[1][0] * bv[0] + A[0][0] * bv[1]) / det];
  const L = (w1: number, w2: number) => data.reduce((s, [x1, x2, y]) => s + 0.5 * (w1 * x1 + w2 * x2 - y) ** 2, 0) / 200;
  const { full, sgd } = useMemo(() => {
    const r = rng(1000 + seed);
    const full: number[][] = [[-1.5, 1.5]], sgd: number[][] = [[-1.5, 1.5]];
    for (let k = 0; k < 60; k++) {
      const [a1, a2] = full[full.length - 1];
      full.push([a1 - lr * (A[0][0] * a1 + A[0][1] * a2 - bv[0]), a2 - lr * (A[1][0] * a1 + A[1][1] * a2 - bv[1])]);
      const [s1, s2] = sgd[sgd.length - 1]; let g1 = 0, g2 = 0;
      for (let j = 0; j < batch; j++) { const [x1, x2, y] = data[Math.floor(r() * 200)]; const e = s1 * x1 + s2 * x2 - y; g1 += e * x1 / batch; g2 += e * x2 / batch; }
      sgd.push([s1 - lr * g1, s2 - lr * g2]);
    }
    return { full, sgd };
  }, [batch, lr, seed]);
  const W = 320, C = W / 2, K = 70, cx = 0.2, cy = 0.2;
  const P = (a: number, b: number) => [C + (a - cx) * K, C - (b - cy) * K];
  const n = 36, vals: number[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) vals.push(L(cx + (j + 0.5 - n / 2) * (W / n) / K, cy + (n / 2 - i - 0.5) * (W / n) / K));
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const path = (pts: number[][], colour: string) => <g><polyline points={pts.map(([a, b]) => P(a, b).join(",")).join(" ")} fill="none" stroke={colour} strokeWidth="1.6" />{pts.map(([a, b], i) => <circle key={i} cx={P(a, b)[0]} cy={P(a, b)[1]} r="2" fill={colour} />)}</g>;
  const end = sgd[sgd.length - 1];
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Full-batch and stochastic gradient descent paths">
        <defs><clipPath id="sgc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#sgc)">
          {vals.map((v, k) => { const b = Math.floor(Math.sqrt((v - lo) / (hi - lo || 1)) * 12); return <rect key={k} x={(k % n) * (W / n)} y={Math.floor(k / n) * (W / n)} width={W / n + 1} height={W / n + 1} shapeRendering="crispEdges" fill="var(--accent)" opacity={0.08 + 0.6 * (1 - b / 12) + (b % 2 ? 0.1 : 0)} />; })}
          {path(full, "var(--ai)")}
          {path(sgd, "var(--neuro)")}
          <circle cx={P(wStar[0], wStar[1])[0]} cy={P(wStar[0], wStar[1])[1]} r="6" fill="none" stroke="var(--good)" strokeWidth="2.5" />
        </g>
      </svg>
      <div className="space-y-3">
        <Slider label="minibatch size" value={batch} min={1} max={200} step={1} onChange={setBatch} />
        <Slider label="learning rate η" value={lr} min={0.01} max={0.6} step={0.01} onChange={setLr} fmt={(v) => v.toFixed(2)} />
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>Draw new minibatches</button>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="loss at the end of SGD" value={L(end[0], end[1]).toFixed(4)} />
          <Stat label="lowest possible loss" value={L(wStar[0], wStar[1]).toFixed(4)} />
        </div>
        <p className="text-sm text-ink-2">Blue: full-batch gradient descent on all 200 examples. Pink: stochastic gradient descent, each step using a random minibatch. With one example per step the path jitters around the minimum (green ring) and never settles; larger batches or smaller learning rates make it steadier, at more cost per step. The jitter shrinks in proportion to η and to one over the batch size.</p>
      </div>
    </div>
  );
}
