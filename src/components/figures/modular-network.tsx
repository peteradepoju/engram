"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** A planted-module network with communities found by spectral bisection of the modularity matrix. */
export function ModularNetwork() {
  const [pout, setPout] = useState(0.03);
  const M = 4, n = 15, N = M * n;
  const res = useMemo(() => {
    const r = rng(2009);
    const lab = Array.from({ length: N }, (_, i) => Math.floor(i / n));
    const A = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (r() < (lab[i] === lab[j] ? 0.35 : pout)) { A[i][j] = A[j][i] = 1; }
    const k = A.map((row) => row.reduce((s, v) => s + v, 0)), m2 = k.reduce((s, v) => s + v, 0) || 1;
    const lead = (idx: number[]) => {
      const B = idx.map((i) => idx.map((j) => A[i][j] - (k[i] * k[j]) / m2));
      B.forEach((row, a) => { const s = row.reduce((p, q) => p + q, 0); row[a] -= s; });
      let v = idx.map((_, a) => Math.sin(a + 1)); const shift = 50;
      for (let it = 0; it < 300; it++) { const w = B.map((row, a) => row.reduce((s, b, c) => s + b * v[c], 0) + shift * v[a]); const nn = Math.hypot(...w) || 1; v = w.map((x) => x / nn); }
      return [idx.filter((_, a) => v[a] >= 0), idx.filter((_, a) => v[a] < 0)];
    };
    const c = new Array(N).fill(0); let g = 0;
    for (const part of lead([...Array(N).keys()])) { if (part.length < 2) { part.forEach((i) => (c[i] = g)); g++; continue; } const [p1, p2] = lead(part); p1.forEach((i) => (c[i] = g)); p2.forEach((i) => (c[i] = g + 1)); g += 2; }
    let Q = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (c[i] === c[j]) Q += A[i][j] - (k[i] * k[j]) / m2;
    const edges: [number, number][] = []; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (A[i][j]) edges.push([i, j]);
    return { c, Q: Q / m2, edges, lab };
  }, [pout]);
  const pos = (i: number) => { const m = Math.floor(i / n), a = (2 * Math.PI * (i % n)) / n; const cx = [90, 200, 90, 200][m], cy = [55, 55, 145, 145][m]; return [cx + 32 * Math.cos(a), cy + 32 * Math.sin(a)]; };
  const cols = ["var(--neuro)", "var(--ai)", "var(--ink)", "#d6a24a"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 300 200" className="mx-auto w-full max-w-[420px] rounded-lg bg-surface-2" role="img" aria-label="Modular network">
        {res.edges.map(([i, j], e) => { const [x1, y1] = pos(i), [x2, y2] = pos(j); return <line key={e} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-3)" strokeWidth="0.4" opacity={res.lab[i] === res.lab[j] ? 0.5 : 0.9} />; })}
        {res.c.map((ci, i) => { const [x, y] = pos(i); return <circle key={i} cx={x} cy={y} r="3.2" fill={cols[ci % 4]} />; })}
      </svg>
      <Slider label="probability of a link between modules" value={pout} min={0} max={0.35} step={0.01} onChange={setPout} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="modularity of found partition" value={res.Q.toFixed(2)} />
        <Stat label="links within modules" value="probability 0.35" />
      </div>
      <p className="text-sm text-ink-2">Nodes are placed in their planted modules; colours show the modules found from the modularity matrix. As links between modules become as common as links within them, the colours stop matching the groups and modularity falls towards zero.</p>
    </div>
  );
}
