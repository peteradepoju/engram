"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const f = (x: number): number => Math.sin(4 * x) + x;

/** Gradient boosting with stumps: each round fits a step to the current residuals and adds a shrunken copy. */
export function BoostingSteps() {
  const [rounds, setRounds] = useState(20);
  const [lr, setLr] = useState(0.3);
  const { xs, ys } = useMemo(() => { const r = rng(584); const xs = Array.from({ length: 80 }, () => 2 * r() - 1); return { xs, ys: xs.map((x) => f(x) + 0.3 * gauss(r)) }; }, []);
  const model = useMemo(() => {
    const order = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
    const base = ys.reduce((a, b) => a + b, 0) / ys.length;
    const pred = xs.map(() => base); const stumps: [number, number, number][] = [];
    for (let k = 0; k < rounds; k++) {
      const res = ys.map((y, i) => y - pred[i]);
      let best = { t: 0, a: 0, b: 0, sse: Infinity }; let sl = 0, nl = 0; const tot = res.reduce((a, b) => a + b, 0);
      for (let q = 0; q < order.length - 1; q++) {
        sl += res[order[q]]; nl++;
        const a = sl / nl, b = (tot - sl) / (order.length - nl);
        const sse = -(nl * a * a + (order.length - nl) * b * b);
        if (sse < best.sse) best = { t: (xs[order[q]] + xs[order[q + 1]]) / 2, a, b, sse };
      }
      stumps.push([best.t, lr * best.a, lr * best.b]);
      xs.forEach((x, i) => { pred[i] += x <= best.t ? lr * best.a : lr * best.b; });
    }
    return { base, stumps, pred };
  }, [xs, ys, rounds, lr]);
  const F = (x: number): number => model.stumps.reduce((s, [t, a, b]) => s + (x <= t ? a : b), model.base);
  const grid = Array.from({ length: 201 }, (_, i): number => -1 + i / 100);
  const testErr = grid.reduce((s, x) => s + (F(x) - f(x)) ** 2, 0) / grid.length + 0.09;
  const trainErr = ys.reduce((s, y, i) => s + (y - model.pred[i]) ** 2, 0) / ys.length;
  const sx = (x: number): number => 20 + (x + 1) * 150, sy = (y: number): number => 95 - y * 35;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 185" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Gradient boosting fit">
        <polyline points={grid.map((x) => `${sx(x)},${sy(f(x))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" />
        <polyline points={grid.map((x) => `${sx(x)},${sy(F(x))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        {xs.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(ys[i])} r="2.5" fill="var(--ink)" />)}
      </svg>
      <Slider label="boosting rounds" value={rounds} min={0} max={300} step={1} onChange={setRounds} />
      <Slider label="learning rate" value={lr} min={0.02} max={1} step={0.02} onChange={setLr} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="training MSE" value={trainErr.toFixed(3)} />
        <Stat label="expected test MSE" value={testErr.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each round fits a single step (a stump) to what the model still gets wrong and adds a shrunken copy. Few rounds underfit; many rounds with a large learning rate chase the noise. A small learning rate needs more rounds but overfits more gently.</p>
    </div>
  );
}
