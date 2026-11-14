"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const P = 40, T = 120;
const PARTS = [8, 20, 31].map((c) => Array.from({ length: P }, (_, i): number => Math.exp(-0.5 * ((i - c) / 2.5) ** 2)));

/** NMF against PCA on data built from non-negative parts: three cells' footprints along a line of pixels. */
export function NmfParts() {
  const [rank, setRank] = useState(3);
  const res = useMemo(() => {
    const r = rng(613);
    const act = PARTS.map(() => Array.from({ length: T }, () => (r() < 0.15 ? 1 + 2 * r() : 0)));
    const X = Array.from({ length: T }, (_, t) => Array.from({ length: P }, (_, i) => PARTS.reduce((s, part, k) => s + act[k][t] * part[i], 0) + 0.05 * r()));
    let W = Array.from({ length: T }, () => Array.from({ length: rank }, () => r() + 0.1));
    let H = Array.from({ length: rank }, () => Array.from({ length: P }, () => r() + 0.1));
    const mul = (A: number[][], B: number[][]): number[][] => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
    const tr = (A: number[][]): number[][] => A[0].map((_, j) => A.map((row) => row[j]));
    for (let it = 0; it < 250; it++) {
      const WtX = mul(tr(W), X), WtWH = mul(mul(tr(W), W), H);
      H = H.map((row, k) => row.map((h, j) => (h * WtX[k][j]) / (WtWH[k][j] + 1e-9)));
      const XHt = mul(X, tr(H)), WHHt = mul(W, mul(H, tr(H)));
      W = W.map((row, t) => row.map((w, k) => (w * XHt[t][k]) / (WHHt[t][k] + 1e-9)));
    }
    const WH = mul(W, H);
    const err = X.reduce((s, row, t) => s + row.reduce((a, x, i) => a + (x - WH[t][i]) ** 2, 0), 0) / X.reduce((s, row) => s + row.reduce((a, x) => a + x * x, 0), 0);
    const mean = Array.from({ length: P }, (_, i) => X.reduce((s, row) => s + row[i], 0) / T);
    const C = Array.from({ length: P }, (_, i) => Array.from({ length: P }, (_, j) => X.reduce((s, row) => s + (row[i] - mean[i]) * (row[j] - mean[j]), 0) / T));
    const pcs: number[][] = [];
    for (let k = 0; k < rank; k++) {
      let v = Array.from({ length: P }, (_, i) => Math.sin(i + k + 1));
      for (let it = 0; it < 200; it++) {
        let w = C.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
        pcs.forEach((u) => { const d = w.reduce((s, x, i) => s + x * u[i], 0); w = w.map((x, i) => x - d * u[i]); });
        const n = Math.hypot(...w); v = w.map((x) => x / n);
      }
      pcs.push(v);
    }
    const nmfParts = H.map((row) => { const m = Math.max(...row); return row.map((x) => x / (m || 1)); });
    return { pcs, nmfParts, err };
  }, [rank]);
  const sx = (i: number): number => 12 + i * 3.8;
  const cols = ["var(--neuro)", "var(--ai)", "var(--warn)", "var(--good)", "var(--ink-3)"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="PCA and NMF components">
        <line x1="10" x2="165" y1="80" y2="80" stroke="var(--line)" />
        {res.pcs.map((v, k) => { const m = Math.max(...v.map(Math.abs)); return <polyline key={k} points={v.map((x, i) => `${sx(i)},${80 - (x / m) * 55}`).join(" ")} fill="none" stroke={cols[k]} strokeWidth="1.6" />; })}
        <line x1="175" x2="330" y1="140" y2="140" stroke="var(--line)" />
        {res.nmfParts.map((v, k) => <polyline key={k} points={v.map((x, i) => `${175 + i * 3.8},${140 - x * 110}`).join(" ")} fill="none" stroke={cols[k]} strokeWidth="1.6" />)}
        <text x="88" y="162" fontSize="9" textAnchor="middle" fill="var(--ink-3)">PCA components (signed)</text>
        <text x="252" y="162" fontSize="9" textAnchor="middle" fill="var(--ink-3)">NMF components (non-negative)</text>
      </svg>
      <Slider label="number of components" value={rank} min={1} max={5} step={1} onChange={setRank} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="NMF relative reconstruction error" value={res.err.toFixed(4)} />
        <Stat label="true number of cells" value="3" />
      </div>
      <p className="text-sm text-ink-2">Each frame of this imaging movie is a sum of three cells' footprints, scaled by their activity. PCA components must be orthogonal, so they mix the cells with positive and negative weights. NMF requires every component and every weight to be non-negative, so at rank 3 its components are the cells themselves: parts that add up, as Lee and Seung argued.</p>
    </div>
  );
}
