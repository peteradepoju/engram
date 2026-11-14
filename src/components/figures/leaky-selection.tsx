"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const N = 40, K = 10, FOLDS = 5, REPS = 6;

/** Selecting features on all the data before cross-validation decodes pure noise. */
export function LeakySelection() {
  const [p, setP] = useState(500);
  const res = useMemo(() => {
    const r = rng(593);
    const y = Array.from({ length: N }, (_, i): number => i % 2);
    const top = (X: number[][], idx: number[]): number[] => {
      const t = X[0].map((_, j) => {
        let a = 0, b = 0, na = 0, nb = 0;
        idx.forEach((i) => { if (y[i]) { a += X[i][j]; na++; } else { b += X[i][j]; nb++; } });
        return [Math.abs(a / na - b / nb), j];
      });
      return t.sort((u, v) => v[0] - u[0]).slice(0, K).map((u) => u[1]);
    };
    const cv = (X: number[][], leaky: boolean): number => {
      const all = Array.from({ length: N }, (_, i) => i);
      const fixed = leaky ? top(X, all) : null;
      let right = 0;
      for (let f = 0; f < FOLDS; f++) {
        const te = all.filter((i) => i % FOLDS === f), tr = all.filter((i) => i % FOLDS !== f);
        const feats = fixed ?? top(X, tr);
        const cen = [0, 1].map((c) => feats.map((j) => { const m = tr.filter((i) => y[i] === c); return m.reduce((s, i) => s + X[i][j], 0) / m.length; }));
        te.forEach((i) => {
          const d = cen.map((cc) => feats.reduce((s, j, q) => s + (X[i][j] - cc[q]) ** 2, 0));
          if ((d[1] < d[0] ? 1 : 0) === y[i]) right++;
        });
      }
      return right / N;
    };
    let leak = 0, honest = 0;
    for (let rep = 0; rep < REPS; rep++) {
      const X = Array.from({ length: N }, () => Array.from({ length: p }, () => gauss(r)));
      leak += cv(X, true) / REPS; honest += cv(X, false) / REPS;
    }
    return { leak, honest };
  }, [p]);
  const bar = (v: number, x: number, c: string, label: string) => (
    <g>
      <rect x={x} y={150 - v * 130} width="80" height={v * 130} fill={c} opacity="0.8" />
      <text x={x + 40} y={145 - v * 130} fontSize="9" textAnchor="middle" fill="var(--ink)">{(100 * v).toFixed(0)}%</text>
      <text x={x + 40} y="163" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{label}</text>
    </g>
  );
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Leaky and honest cross-validated accuracy on noise">
        <line x1="30" x2="320" y1={150 - 0.5 * 130} y2={150 - 0.5 * 130} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x="318" y={150 - 0.5 * 130 - 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">chance</text>
        {bar(res.leak, 70, "var(--neuro)", "select on all data, then CV")}
        {bar(res.honest, 190, "var(--ai)", "select inside each fold")}
      </svg>
      <Slider label="features recorded (all pure noise)" value={p} min={20} max={2000} step={20} onChange={setP} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="leaky accuracy" value={res.leak.toFixed(2)} />
        <Stat label="honest accuracy" value={res.honest.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Forty trials, two labels, and features that carry no information at all. Choosing the 10 features that best separate the labels using every trial, then cross-validating a decoder on them, reports accuracy far above chance, and the more features there were to choose from, the higher it climbs. Repeating the selection inside each training fold gives the honest answer: chance.</p>
    </div>
  );
}
