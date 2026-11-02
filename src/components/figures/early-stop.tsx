"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Gradient descent on an overparameterised linear model: training error falls for ever, test error turns back up. */
export function EarlyStop() {
  const [noise, setNoise] = useState(1);
  const [p, setP] = useState(35);
  const { trainErr, testErr } = useMemo(() => {
    const r = rng(83), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    const n = 30, nt = 200;
    const wTrue = Array.from({ length: p }, (_, j) => g() * Math.exp(-j / 10));
    const mk = (m: number) => { const X = Array.from({ length: m }, () => Array.from({ length: p }, g)); const y = X.map((row) => row.reduce((s, v, j) => s + v * wTrue[j], 0) + noise * g()); return { X, y }; };
    const tr = mk(n), te = mk(nt);
    const lr = 0.8 / (1 + Math.sqrt(p / n)) ** 2;   // below 2 / (largest curvature), which is about (1 + sqrt(p/n))^2 for random inputs
    const w = new Array(p).fill(0), trainErr: number[] = [], testErr: number[] = [];
    const mse = (D: { X: number[][]; y: number[] }) => D.y.reduce((s, yv, i) => s + (D.X[i].reduce((a, v, j) => a + v * w[j], 0) - yv) ** 2, 0) / D.y.length;
    for (let k = 0; k <= 1500; k++) {
      if (k % 10 === 0) { trainErr.push(mse(tr)); testErr.push(mse(te)); }
      const res = tr.X.map((row, i) => row.reduce((a, v, j) => a + v * w[j], 0) - tr.y[i]);
      for (let j = 0; j < p; j++) { let gj = 0; for (let i = 0; i < n; i++) gj += res[i] * tr.X[i][j]; w[j] -= lr * gj / n; }
    }
    return { trainErr, testErr };
  }, [noise, p]);
  const best = testErr.indexOf(Math.min(...testErr));
  const W = 540, H = 230, X = (k: number) => 40 + (k / (testErr.length - 1)) * (W - 60);
  const hi = Math.min(Math.max(testErr[0], ...testErr), 4 * testErr[best]);
  const Y = (v: number) => 40 + (1 - Math.min(v, hi) / hi) * (H - 78);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Training and test error against iteration">
        <polyline points={trainErr.map((v, k) => `${X(k)},${Y(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.2" />
        <polyline points={testErr.map((v, k) => `${X(k)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.2" />
        <line x1={X(best)} x2={X(best)} y1="36" y2={H - 28} stroke="var(--good)" strokeDasharray="4 3" />
        <text x={X(best) + 4} y={H - 34} fontSize="10" fill="var(--good)">stop here</text>
        <text x="44" y={H - 10} fontSize="10" fill="var(--ink-3)">gradient-descent iterations (0 to 1500); mean squared error</text>
        <text x={W - 10} y="16" fontSize="10" textAnchor="end" fill="var(--ai)">training error</text>
        <text x={W - 10} y="30" fontSize="10" textAnchor="end" fill="var(--neuro)">test error</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="label noise" value={noise} min={0} max={2} step={0.05} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
        <Slider label="number of features (30 training examples)" value={p} min={10} max={80} step={5} onChange={setP} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="best test error" value={testErr[best].toFixed(3)} />
        <Stat label="at iteration" value={String(best * 10)} />
        <Stat label="test error at the end" value={testErr[testErr.length - 1].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Thirty noisy examples, and at least as many features as examples. Gradient descent first fits the large, real structure (both errors fall) and then slowly fits the noise: training error keeps falling towards zero while test error climbs. Stopping at the minimum of a held-out error, early stopping, acts like a penalty on the size of the weights. With little noise or few features there is little to overfit and the curves never separate much; with many more features than examples, overfitting is milder again.</p>
    </div>
  );
}
