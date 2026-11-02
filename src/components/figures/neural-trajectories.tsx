"use client";

import { useMemo, useState } from "react";
import { symEig } from "./linalg";
import { rng, Stat } from "./util";

const NN = 50, TT = 40, CONDS = 4;
const COLOURS = ["var(--neuro)", "var(--ai)", "var(--warn)", "var(--good)"];

/** 50 simulated neurons during four reaches. PCA finds the few dimensions where the population's activity actually moves. */
export function NeuralTrajectories() {
  const [pair, setPair] = useState<[number, number]>([0, 1]);
  const { proj, values } = useMemo(() => {
    const r = rng(2012), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    const M = Array.from({ length: NN }, () => [g(), g(), g() * 0.8]);
    const X: number[][] = [];
    for (let c = 0; c < CONDS; c++) for (let t = 0; t < TT; t++) {
      const x = t / (TT - 1), env = Math.sin(Math.PI * x), ph = 2 * Math.PI * x + (c * Math.PI) / 2;
      const z = [env * Math.cos(ph), env * Math.sin(ph), x];
      X.push(M.map((w) => 10 + 3 * (w[0] * z[0] + w[1] * z[1] + w[2] * z[2]) + 0.8 * g()));
    }
    const mu = X[0].map((_, j) => X.reduce((s, row) => s + row[j], 0) / X.length);
    const Xc = X.map((row) => row.map((v, j) => v - mu[j]));
    const S = mu.map((_, i) => mu.map((__, j) => Xc.reduce((s, row) => s + row[i] * row[j], 0) / (Xc.length - 1)));
    const { values, vectors } = symEig(S);
    const proj = Xc.map((row) => vectors.slice(0, 3).map((v) => row.reduce((s, x, j) => s + x * v[j], 0)));
    return { proj, values };
  }, []);
  const total = values.reduce((a, v) => a + v, 0);
  const pr = total ** 2 / values.reduce((a, v) => a + v * v, 0);
  const W = 300, C = W / 2;
  const ext = Math.max(...proj.flatMap((p) => [Math.abs(p[pair[0]]), Math.abs(p[pair[1]])])) * 1.1;
  const P = (p: number[]) => [C + (p[pair[0]] / ext) * (C - 10), C - (p[pair[1]] / ext) * (C - 10)];
  const pairs: [number, number][] = [[0, 1], [0, 2], [1, 2]];
  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[300px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Population trajectories in principal component space">
        <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
        {Array.from({ length: CONDS }, (_, c) => {
          const seg = proj.slice(c * TT, (c + 1) * TT);
          const s0 = P(seg[0]);
          return <g key={c}><polyline points={seg.map((p) => P(p).join(",")).join(" ")} fill="none" stroke={COLOURS[c]} strokeWidth="2.2" /><circle cx={s0[0]} cy={s0[1]} r="4" fill={COLOURS[c]} /></g>;
        })}
        <text x={W - 6} y={C - 6} fontSize="10" textAnchor="end" fill="var(--ink-3)">PC{pair[0] + 1}</text>
        <text x={C + 6} y="14" fontSize="10" fill="var(--ink-3)">PC{pair[1] + 1}</text>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {pairs.map((p) => <button key={p.join()} className={`btn !py-1.5 ${pair[0] === p[0] && pair[1] === p[1] ? "btn-primary" : ""}`} onClick={() => setPair(p)}>PC{p[0] + 1} against PC{p[1] + 1}</button>)}
        </div>
        <svg viewBox="0 0 300 110" className="w-full rounded-lg bg-surface-2" role="img" aria-label="Variance explained by each component">
          {values.slice(0, 12).map((v, i) => <rect key={i} x={20 + i * 22} y={92 - (v / values[0]) * 76} width="15" height={(v / values[0]) * 76} fill={i < 3 ? "var(--accent)" : "var(--ink-3)"} />)}
          <text x="20" y="106" fontSize="10" fill="var(--ink-3)">variance of PC1 to PC12 (scree plot)</text>
        </svg>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="variance in the first 3 PCs" value={`${(100 * values.slice(0, 3).reduce((a, v) => a + v, 0) / total).toFixed(1)}%`} />
          <Stat label="participation ratio" value={pr.toFixed(1)} />
        </div>
        <p className="text-sm text-ink-2">Fifty neurons, four reach directions (one colour each, dots at movement onset). Each neuron mixes three hidden signals with its own weights, plus noise. In PC1 against PC2 the population rotates, a different phase for each reach; PC3 carries a slow ramp shared by all conditions. Beyond three components there is only noise.</p>
      </div>
    </div>
  );
}
