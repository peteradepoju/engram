"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** A Watts-Strogatz ring with adjustable rewiring, with clustering and path length relative to the lattice. */
export function SmallWorld() {
  const [logp, setLogp] = useState(-1.5);
  const N = 40, k = 4;
  const p = Math.pow(10, logp);
  const { edges, C, L } = useMemo(() => {
    const build = (pp: number, seed: number) => {
      const r = rng(seed);
      const A = Array.from({ length: N }, () => new Array(N).fill(false));
      for (let i = 0; i < N; i++) for (let j = 1; j <= k / 2; j++) { A[i][(i + j) % N] = A[(i + j) % N][i] = true; }
      for (let i = 0; i < N; i++) for (let j = 1; j <= k / 2; j++) {
        const t = (i + j) % N;
        if (r() < pp && A[i][t]) {
          const cand = [...Array(N).keys()].filter((n) => n !== i && !A[i][n]);
          const n = cand[Math.floor(r() * cand.length)];
          A[i][t] = A[t][i] = false; A[i][n] = A[n][i] = true;
        }
      }
      return A;
    };
    const clus = (A: boolean[][]) => { let s = 0; for (let i = 0; i < N; i++) { const nb = [...Array(N).keys()].filter((j) => A[i][j]); let t = 0; for (let a = 0; a < nb.length; a++) for (let b = a + 1; b < nb.length; b++) if (A[nb[a]][nb[b]]) t++; s += nb.length > 1 ? t / ((nb.length * (nb.length - 1)) / 2) : 0; } return s / N; };
    const path = (A: boolean[][]) => { let tot = 0, cnt = 0; for (let s0 = 0; s0 < N; s0++) { const d = new Array(N).fill(-1); d[s0] = 0; const q = [s0]; while (q.length) { const u = q.shift()!; for (let v = 0; v < N; v++) if (A[u][v] && d[v] < 0) { d[v] = d[u] + 1; q.push(v); } } d.forEach((x, v) => { if (v !== s0 && x > 0) { tot += x; cnt++; } }); } return tot / cnt; };
    const A0 = build(0, 1), A = build(p, 1998);
    const e: [number, number][] = []; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (A[i][j]) e.push([i, j]);
    return { edges: e, C: clus(A) / clus(A0), L: path(A) / path(A0) };
  }, [p]);
  const pos = (i: number) => [110 + 85 * Math.cos((2 * Math.PI * i) / N), 100 + 85 * Math.sin((2 * Math.PI * i) / N)];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 200" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Small-world network">
        {edges.map(([i, j], n) => { const [x1, y1] = pos(i), [x2, y2] = pos(j); const long = Math.min(Math.abs(i - j), N - Math.abs(i - j)) > k / 2; return <line key={n} x1={x1} y1={y1} x2={x2} y2={y2} stroke={long ? "var(--neuro)" : "var(--ink-3)"} strokeWidth={long ? 1.2 : 0.7} />; })}
        {[...Array(N).keys()].map((i) => { const [x, y] = pos(i); return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--ai)" />; })}
        <rect x="230" y={170 - C * 140} width="35" height={C * 140} fill="var(--ai)" />
        <rect x="290" y={170 - L * 140} width="35" height={L * 140} fill="var(--neuro)" />
        <line x1="220" x2="340" y1="170" y2="170" stroke="var(--line)" />
        <text x="247" y="184" fontSize="8" textAnchor="middle" fill="var(--ai)">C / C(0)</text>
        <text x="307" y="184" fontSize="8" textAnchor="middle" fill="var(--neuro)">L / L(0)</text>
      </svg>
      <Slider label="rewiring probability (log10)" value={logp} min={-3} max={0} step={0.05} onChange={setLogp} fmt={(v) => `${Math.pow(10, v).toFixed(3)}`} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="clustering relative to lattice" value={C.toFixed(2)} />
        <Stat label="path length relative to lattice" value={L.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">A ring of 40 nodes, each linked to 4 neighbours; rewired links (pink) become shortcuts. A handful of shortcuts collapses the path length while most triangles survive.</p>
    </div>
  );
}
