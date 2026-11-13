"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Successor representation place fields on a linear track for a chosen policy bias and discount. */
export function SuccessorFields() {
  const [pr, setPr] = useState(0.9);
  const [gamma, setGamma] = useState(0.9);
  const n = 40;
  const fields = useMemo(() => {
    // Solve (I - gamma T) M = I by Gaussian elimination for a tridiagonal-like system.
    const T = Array.from({ length: n }, (_, s) => { const row = new Array(n).fill(0); row[Math.min(s + 1, n - 1)] += pr; row[Math.max(s - 1, 0)] += 1 - pr; return row; });
    const A = T.map((row, i) => row.map((v, j) => (i === j ? 1 : 0) - gamma * v));
    const M = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; [M[c], M[piv]] = [M[piv], M[c]];
      const d = A[c][c];
      for (let j = 0; j < n; j++) { A[c][j] /= d; M[c][j] /= d; }
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; if (f) for (let j = 0; j < n; j++) { A[r][j] -= f * A[c][j]; M[r][j] -= f * M[c][j]; } }
    }
    return [10, 20, 30].map((c) => { const col = M.map((row) => row[c]); const mx = Math.max(...col); return col.map((v) => v / mx); });
  }, [pr, gamma]);
  const com = (() => { const f = fields[1]; const s = f.reduce((a, b) => a + b, 0); return f.reduce((a, v, i) => a + v * i, 0) / s; })();
  const cols = ["var(--neuro)", "var(--ai)", "var(--ink)"];
  const sx = (i: number) => 20 + (i / (n - 1)) * 320, sy = (v: number) => 150 - v * 120;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 170" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Successor representation place fields">
        <line x1="20" x2="340" y1="150" y2="150" stroke="var(--line)" />
        {fields.map((f, k) => <polyline key={k} points={f.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} fill="none" stroke={cols[k]} strokeWidth="2" />)}
        {[10, 20, 30].map((c, k) => <line key={c} x1={sx(c)} x2={sx(c)} y1="25" y2="150" stroke={cols[k]} strokeDasharray="2 3" opacity="0.6" />)}
        <text x="340" y="165" fontSize="8" textAnchor="end" fill="var(--ink-3)">position on track →</text>
      </svg>
      <Slider label="probability of stepping right" value={pr} min={0.1} max={0.99} step={0.01} onChange={setPr} fmt={(v) => v.toFixed(2)} />
      <Slider label="discount γ" value={gamma} min={0.5} max={0.98} step={0.01} onChange={setGamma} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="centre of mass, cell at 20" value={com.toFixed(1)} />
        <Stat label="skew" value={com < 19.5 ? "backward (left)" : com > 20.5 ? "forward (right)" : "none"} />
      </div>
      <p className="text-sm text-ink-2">Three cells with preferred locations at 10, 20 and 30 (dashed lines). Each field shows how strongly each position predicts a future visit to the cell&apos;s location. A rightward habit stretches fields to the left; a larger discount makes them wider.</p>
    </div>
  );
}
