"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

const D = 20;
const K = (() => { const k = Array.from({ length: D }, (_, i) => Math.exp(-i / 4) * Math.sin(i / 2.5)); const n = Math.hypot(...k); return k.map((v) => v / n); })();

function solve(A: number[][], b: number[]) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

/** An LNP neuron with a biphasic temporal filter driven by AR(1) noise: the true filter, the spike-triggered average and the whitened (least-squares) estimate. */
export function WhitenedSTA() {
  const [rho, setRho] = useState(0.9);
  const [lT, setLT] = useState(4);
  const T = Math.round(10 ** lT);
  const { sta, wsta } = useMemo(() => {
    const r = rng(35), n = T + D, x = new Array(n);
    x[0] = gauss(r); for (let t = 1; t < n; t++) x[t] = rho * x[t - 1] + Math.sqrt(1 - rho * rho) * gauss(r);
    const rows: number[][] = [], lin: number[] = [];
    for (let t = D; t < n; t++) { const row = Array.from({ length: D }, (_, j) => x[t - j]); rows.push(row); lin.push(row.reduce((a, v, j) => a + v * K[j], 0)); }
    const sd = Math.sqrt(lin.reduce((a, v) => a + v * v, 0) / lin.length);
    const y = lin.map((v) => poisson(Math.exp(v / sd - 2), r));
    const sta = new Array(D).fill(0), XtX = Array.from({ length: D }, () => new Array(D).fill(0));
    rows.forEach((row, t) => { for (let i = 0; i < D; i++) { sta[i] += row[i] * y[t]; for (let j = i; j < D; j++) XtX[i][j] += row[i] * row[j]; } });
    for (let i = 0; i < D; i++) for (let j = 0; j < i; j++) XtX[i][j] = XtX[j][i];
    return { sta, wsta: solve(XtX, sta) };
  }, [rho, T]);
  const unit = (v: number[]) => { const n = Math.hypot(...v) || 1; return v.map((a) => a / n); };
  const cos = (v: number[]) => unit(v).reduce((a, b, i) => a + b * K[i], 0);
  const W = 360, H = 190, x0 = 20, x1 = 350, ym = 95;
  const X = (i: number) => x0 + (i / (D - 1)) * (x1 - x0);
  const line = (v: number[]) => unit(v).map((a, i) => `${X(i)},${ym - a * 130}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="True filter, spike-triggered average and whitened estimate">
        <line x1={x0} x2={x1} y1={ym} y2={ym} stroke="var(--line)" />
        <polyline points={line(K)} fill="none" stroke="var(--ink-3)" strokeWidth="3" opacity="0.6" />
        <polyline points={line(sta)} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={line(wsta)} fill="none" stroke="var(--ai)" strokeWidth="2" strokeDasharray="5 3" />
        <text x={x1} y="14" fontSize="9" textAnchor="end" fill="var(--ink-3)">grey: true filter</text>
        <text x={x1} y="26" fontSize="9" textAnchor="end" fill="var(--neuro)">spike-triggered average</text>
        <text x={x1} y="38" fontSize="9" textAnchor="end" fill="var(--ai)">whitened (least squares)</text>
        <text x={x1} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">lag 0 to 19 bins</text>
      </svg>
      <Slider label="stimulus correlation between frames" value={rho} min={0} max={0.97} step={0.01} onChange={setRho} fmt={(v) => v.toFixed(2)} />
      <Slider label="time bins of data" value={lT} min={2.7} max={4.5} step={0.05} onChange={setLT} fmt={() => `${T}`} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="STA similarity" value={cos(sta).toFixed(3)} />
        <Stat label="whitened similarity" value={cos(wsta).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">With white noise (correlation 0) both estimates match the filter. As the frames become correlated, the STA smears into a smooth, stretched version of the filter, while the whitened estimate stays on target, given enough data. With little data and strong correlation, the whitened estimate becomes noisy at the fast wiggles the stimulus rarely contains: that is where regularisation helps.</p>
    </div>
  );
}
