"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

const N = 24;

function features(th: number, pd: number[], r: () => number) {
  return pd.map((p, i) => poisson(0.5 * 4 * Math.exp((i < 18 ? 2.2 * Math.cos(2 * (th - p)) : 1.0 * Math.cos(th - p))), r));
}

function solve(A: number[][], b: number[]) {
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}

/** Direction decoded from 18 axially tuned and 6 weakly direction-tuned Poisson neurons, by a linear decoder (to cos and sin) or a 15-nearest-neighbour decoder, against training-set size. */
export function DecoderCapacity() {
  const [nTr, setNTr] = useState(3000);
  const data = useMemo(() => {
    const r = rng(2020), pd = Array.from({ length: N }, () => r() * 2 * Math.PI);
    const mk = (n: number) => Array.from({ length: n }, () => { const th = r() * 2 * Math.PI; return { th, z: features(th, pd, r) }; });
    return { train: mk(3000), test: mk(250) };
  }, []);
  const { lin, knn, eLin, eKnn } = useMemo(() => {
    const tr = data.train.slice(0, nTr), d = N + 1;
    const A = Array.from({ length: d }, () => new Array(d).fill(0)), bc = new Array(d).fill(0), bs = new Array(d).fill(0);
    for (const s of tr) { const f = [...s.z, 1]; for (let i = 0; i < d; i++) { bc[i] += f[i] * Math.cos(s.th); bs[i] += f[i] * Math.sin(s.th); for (let j = 0; j < d; j++) A[i][j] += f[i] * f[j]; } }
    for (let i = 0; i < d; i++) A[i][i] += 1;
    const wc = solve(A, bc), ws = solve(A.map((row) => [...row]), bs);
    const ang = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    const lin = data.test.map((s) => { const f = [...s.z, 1]; return Math.atan2(f.reduce((a, v, i) => a + v * ws[i], 0), f.reduce((a, v, i) => a + v * wc[i], 0)); });
    const knn = data.test.map((s) => {
      const ds = tr.map((t) => ({ d: t.z.reduce((a, v, i) => a + (v - s.z[i]) ** 2, 0), th: t.th })).sort((a, b) => a.d - b.d).slice(0, 15);
      return Math.atan2(ds.reduce((a, q) => a + Math.sin(q.th), 0), ds.reduce((a, q) => a + Math.cos(q.th), 0));
    });
    const mean = (est: number[]) => (data.test.reduce((a, s, i) => a + ang(est[i], s.th), 0) / data.test.length) * 180 / Math.PI;
    return { lin, knn, eLin: mean(lin), eKnn: mean(knn) };
  }, [data, nTr]);
  const W = 360, S = 150, pts = (est: number[], x0: number) => data.test.map((s, i) => {
    let e = est[i]; if (e < 0) e += 2 * Math.PI;
    return <circle key={i} cx={x0 + (s.th / (2 * Math.PI)) * S} cy={175 - (e / (2 * Math.PI)) * S} r="1.6" fill="var(--ai)" opacity="0.6" />;
  });
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 200`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Decoded against true direction for a linear and a nearest-neighbour decoder">
        {[20, 195].map((x0, k) => (
          <g key={x0}>
            <rect x={x0} y="25" width={S} height={S} fill="none" stroke="var(--line)" />
            <line x1={x0} y1="175" x2={x0 + S} y2="25" stroke="var(--ink-3)" strokeDasharray="3 3" />
            <text x={x0} y="16" fontSize="9" fill="var(--ink-2)">{k === 0 ? "linear decoder" : "nearest neighbours"}</text>
          </g>
        ))}
        {pts(lin, 20)}{pts(knn, 195)}
        <text x="180" y="194" fontSize="9" textAnchor="middle" fill="var(--ink-3)">true direction (0 to 360°) against decoded</text>
      </svg>
      <Slider label="training trials" value={nTr} min={25} max={3000} step={25} onChange={setNTr} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean error, linear" value={`${eLin.toFixed(0)}°`} />
        <Stat label="mean error, nearest neighbours" value={`${eKnn.toFixed(0)}°`} />
      </div>
      <p className="text-sm text-ink-2">Most of these neurons fire the same for opposite directions. The linear decoder can only use the six weakly direction-tuned cells, and more data barely helps it. The nearest-neighbour decoder looks up training trials with similar patterns of activity, so it can use the axial cells too. With a hundred or so trials it is no better than linear, because its neighbours are far apart in a 24-dimensional space; with a few thousand its error is less than half the linear decoder's, and the points close in on the diagonal, apart from a few errors near 180° where the weak cells point the wrong way.</p>
    </div>
  );
}
