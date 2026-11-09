"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Lebedev's point: neurons that simply fire in sequence give rotating trajectories after PCA, without any rotational dynamics. */
export function SequenceRotation() {
  const [width, setWidth] = useState(40);
  const [jitter, setJitter] = useState(0);
  const N = 40, T = 41, C = 8;
  const { proj, ve } = useMemo(() => {
    const r = rng(2019);
    const peaks = Array.from({ length: N }, (_, i) => -50 + (i / (N - 1)) * 200 + jitter * (r() - 0.5) * 200);
    const gains = Array.from({ length: C }, () => Array.from({ length: N }, () => 0.6 + 0.8 * r()));
    const ts = Array.from({ length: T }, (_, j) => -50 + j * 5);
    // data: (C*T) x N, then centre and find the top two principal components by power iteration
    const rows: number[][] = [];
    for (let c = 0; c < C; c++) for (const t of ts) rows.push(peaks.map((p, n) => gains[c][n] * Math.exp(-((t - p) ** 2) / (2 * width * width))));
    const mu = Array.from({ length: N }, (_, n) => rows.reduce((s, row) => s + row[n], 0) / rows.length);
    const X = rows.map((row) => row.map((v, n) => v - mu[n]));
    const cov = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => X.reduce((s, row) => s + row[i] * row[j], 0)));
    const total = cov.reduce((s, row, i) => s + row[i], 0);
    const comps: number[][] = []; const vals: number[] = [];
    for (let k = 0; k < 2; k++) {
      let v = Array.from({ length: N }, (_, i) => Math.sin(i + k + 1));
      for (let it = 0; it < 200; it++) {
        let w = cov.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
        for (const u of comps) { const dot = w.reduce((s, x, j) => s + x * u[j], 0); w = w.map((x, j) => x - dot * u[j]); }
        const nrm = Math.hypot(...w); v = w.map((x) => x / nrm);
      }
      comps.push(v); vals.push(cov.map((row) => row.reduce((s, x, j) => s + x * v[j], 0)).reduce((s, x, i) => s + x * v[i], 0));
    }
    const proj = Array.from({ length: C }, (_, c) => ts.map((_, j) => comps.map((u) => X[c * T + j].reduce((s, x, n) => s + x * u[n], 0))));
    return { proj, ve: (vals[0] + vals[1]) / total };
  }, [width, jitter]);
  const m = Math.max(...proj.flat(2).map(Math.abs)) * 1.05;
  const W = 360, H = 260, Xc = (v: number) => W / 2 + (v / m) * (W / 2 - 14), Yc = (v: number) => H / 2 - (v / m) * (H / 2 - 14);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Trajectories of a simulated sequence of neurons in two principal components">
        <line x1="10" x2={W - 10} y1={H / 2} y2={H / 2} stroke="var(--line)" />
        <line x1={W / 2} x2={W / 2} y1="10" y2={H - 10} stroke="var(--line)" />
        {proj.map((c, i) => <polyline key={i} points={c.map((p) => `${Xc(p[0])},${Yc(p[1])}`).join(" ")} fill="none" stroke={`hsl(${i * 45} 65% 55%)`} strokeWidth="1.5" />)}
        <text x={W - 12} y={H / 2 - 5} fontSize="10" textAnchor="end" fill="var(--ink-3)">PC1</text>
        <text x={W / 2 + 5} y="20" fontSize="10" fill="var(--ink-3)">PC2</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="width of each neuron's burst" value={width} min={10} max={80} step={1} onChange={setWidth} unit="ms" />
        <Slider label="disorder in the sequence" value={jitter} min={0} max={1} step={0.05} onChange={setJitter} />
      </div>
      <Stat label="variance in the top two components" value={`${(ve * 100).toFixed(0)}%`} />
      <p className="text-sm text-ink-2">Forty simulated neurons each fire one burst, in a fixed order, with a different random strength for each of eight conditions. Nothing here is a dynamical system, yet plain PCA turns the sequence into curves that swing round the origin. Lebedev and colleagues (2019) argued that sequences like this can create apparent rotations; Day 5 tests which simple explanations could produce the rotations in the reaching data.</p>
    </div>
  );
}
