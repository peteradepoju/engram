"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const rm = 20000, ri = 150, NP = 40;
const lamCm = (dUm: number) => Math.sqrt((rm * dUm * 1e-4) / (4 * ri));

function solve(A: number[][], b: number[]) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let k = 0; k < n; k++) {
    let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    [M[k], M[p]] = [M[p], M[k]];
    for (let i = k + 1; i < n; i++) { const f = M[i][k] / M[k][k]; if (f !== 0) for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}

/** Steady-state voltage (1 nA into the root) along a 4 μm parent and one of two equal daughters, against electrotonic distance, compared with the equivalent cylinder. */
function treeProfile(segs: [number, number, number | null][]) {
  const gm: number[] = [], edges: [number, number, number][] = [], last: Record<number, number> = {}, X: number[] = [];
  segs.forEach(([dUm, L, parent], s) => {
    const d = dUm * 1e-4, dx = L / NP, start = gm.length, lam = lamCm(dUm);
    const x0 = parent === null ? 0 : X[last[parent]] + (segs[parent][1] / NP / 2) / lamCm(segs[parent][0]);
    for (let j = 0; j < NP; j++) {
      gm.push((Math.PI * d * dx) / rm); X.push(x0 + ((j + 0.5) * dx) / lam);
      if (j > 0) edges.push([start + j - 1, start + j, (Math.PI * d * d) / (4 * ri * dx)]);
    }
    if (parent !== null) {
      const [pd, pL] = segs[parent];
      const r = (4 * ri * (pL / NP / 2)) / (Math.PI * (pd * 1e-4) ** 2) + (4 * ri * (dx / 2)) / (Math.PI * d * d);
      edges.push([last[parent], start, 1 / r]);
    }
    last[s] = start + NP - 1;
  });
  const n = gm.length, A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? gm[i] : 0)));
  for (const [i, j, g] of edges) { A[i][i] += g; A[j][j] += g; A[i][j] -= g; A[j][i] -= g; }
  const b = new Array(n).fill(0); b[0] = 1e-9;
  return { V: solve(A, b), X };
}

export function BranchRule() {
  const [dd, setDd] = useState(2.52);
  const { tree, cyl } = useMemo(() => {
    const tree = treeProfile([[4, 0.6 * lamCm(4), null], [dd, 0.6 * lamCm(dd), 0], [dd, 0.6 * lamCm(dd), 0]]);
    const cyl = treeProfile([[4, 1.2 * lamCm(4), null]]);
    return { tree, cyl };
  }, [dd]);
  const path = tree.V.slice(0, 2 * NP).map((v, i) => ({ x: tree.X[i], v }));
  const ratio = (2 * dd ** 1.5) / 4 ** 1.5;
  const W = 360, H = 200, x0 = 40, x1 = 350, y0 = 12, y1 = 180;
  const vmax = Math.max(tree.V[0], cyl.V[0]) * 1.05;
  const Xs = (x: number) => x0 + (x / 1.25) * (x1 - x0);
  const Y = (v: number) => y1 - (v / vmax) * (y1 - y0);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Voltage along a branching tree and its equivalent cylinder">
        <line x1={Xs(0.6)} x2={Xs(0.6)} y1={y0} y2={y1} stroke="var(--ink-3)" strokeDasharray="3 3" opacity="0.6" />
        <text x={Xs(0.6) + 3} y={y1 - 8} fontSize="9" fill="var(--ink-3)">branch point</text>
        <polyline points={cyl.V.map((v, i) => `${Xs(cyl.X[i])},${Y(v)}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="5 3" />
        <polyline points={path.map((p) => `${Xs(p.x)},${Y(p.v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.2" />
        <line x1={x0} x2={x1} y1={y1} y2={y1} stroke="var(--line)" />
        <text x={x1} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">electrotonic distance from the root (x/λ)</text>
        <text x={x1} y={y0 + 10} fontSize="9" textAnchor="end" fill="var(--ai)">tree (parent, then a daughter)</text>
        <text x={x1} y={y0 + 22} fontSize="9" textAnchor="end" fill="var(--ink-3)">equivalent cylinder</text>
      </svg>
      <Slider label="daughter diameter" value={dd} min={1} max={4} step={0.02} onChange={setDd} unit="μm" fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Σ d^1.5 / parent" value={ratio.toFixed(2)} />
        <Stat label="tree input resistance" value={`${(tree.V[0] / 1e-9 / 1e6).toFixed(0)} MΩ`} />
        <Stat label="cylinder" value={`${(cyl.V[0] / 1e-9 / 1e6).toFixed(0)} MΩ`} />
      </div>
      <p className="text-sm text-ink-2">A 4 μm parent, 0.6 length constants long, splits into two equal daughters, each 0.6 of its own length constant long. At 2.52 μm the daughters satisfy Rall's rule and the tree's voltage follows the cylinder's through the branch point. Thinner daughters load the parent less, so the voltage stays higher and the input resistance rises; thicker ones load it more.</p>
    </div>
  );
}
