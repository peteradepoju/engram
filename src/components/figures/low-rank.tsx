"use client";

import { useMemo, useState } from "react";
import { svd } from "./linalg";
import { rng, Slider, Stat } from "./util";

const N = 30, T = 48;

/** A neurons-by-time activity matrix rebuilt from its first k singular components. */
export function LowRank() {
  const [k, setK] = useState(3);
  const [noise, setNoise] = useState(0.35);
  return <LowRankInner k={k} setK={setK} noise={noise} setNoise={setNoise} />;
}

function LowRankInner({ k, setK, noise, setNoise }: { k: number; setK: (v: number) => void; noise: number; setNoise: (v: number) => void }) {
  const base = useMemo(() => {
    const r = rng(42), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    const t = Array.from({ length: T }, (_, j) => j / (T - 1));
    const lat = [t.map((x) => Math.sin(Math.PI * x)), t.map((x) => Math.sin(2 * Math.PI * x)), t.map((x) => Math.exp(-((x - 0.7) ** 2) / 0.01))];
    const load = Array.from({ length: N }, () => [g(), g() * 0.7, g() * 0.5]);
    const noiseM = Array.from({ length: N }, () => Array.from({ length: T }, g));
    const clean = load.map((w) => t.map((_, j) => w[0] * lat[0][j] + w[1] * lat[1][j] + w[2] * lat[2][j]));
    return { clean, noiseM };
  }, []);
  const { R, dec } = useMemo(() => {
    const R = base.clean.map((row, i) => row.map((v, j) => v + noise * base.noiseM[i][j]));
    return { R, dec: svd(R) };
  }, [base, noise]);
  const recon = R.map((_, i) => R[0].map((__, j) => { let x = 0; for (let q = 0; q < k; q++) x += dec.s[q] * dec.U[q][i] * dec.V[q][j]; return x; }));
  const total = dec.s.reduce((a, v) => a + v * v, 0), kept = dec.s.slice(0, k).reduce((a, v) => a + v * v, 0);
  const errClean = Math.sqrt(recon.reduce((a, row, i) => a + row.reduce((b, v, j) => b + (v - base.clean[i][j]) ** 2, 0), 0) / (N * T));
  const errRaw = Math.sqrt(R.reduce((a, row, i) => a + row.reduce((b, v, j) => b + (v - base.clean[i][j]) ** 2, 0), 0) / (N * T));
  const cell = 5, Wm = T * cell, Hm = N * cell, vmax = 2.2;
  const heat = (M: number[][], ox: number, key: string) => M.flatMap((row, i) => row.map((v, j) => (
    <rect key={`${key}${i}-${j}`} x={ox + j * cell} y={20 + i * cell} width={cell} height={cell} fill={v >= 0 ? "var(--neuro)" : "var(--ai)"} opacity={Math.min(Math.abs(v) / vmax, 1)} />)));
  const Wt = 2 * Wm + 40;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${Wt} ${Hm + 30}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Activity matrix and its low-rank reconstruction">
        <text x="0" y="13" fontSize="11" fill="var(--ink-3)">recorded activity (30 neurons by 48 time bins)</text>
        <text x={Wm + 40} y="13" fontSize="11" fill="var(--ink-3)">rebuilt from the first {k} component{k > 1 ? "s" : ""}</text>
        {heat(R, 0, "r")}
        {heat(recon, Wm + 40, "k")}
      </svg>
      <svg viewBox="0 0 520 110" className="w-full rounded-lg bg-surface-2" role="img" aria-label="Singular values">
        {dec.s.slice(0, 20).map((v, i) => <rect key={i} x={30 + i * 24} y={95 - (v / dec.s[0]) * 80} width="16" height={(v / dec.s[0]) * 80} fill={i < k ? "var(--accent)" : "var(--ink-3)"} opacity={i < k ? 1 : 0.45} />)}
        <text x="30" y="108" fontSize="10" fill="var(--ink-3)">singular values σ₁, σ₂, ... (the first 20, scaled to σ₁)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="components kept, k" value={k} min={1} max={20} step={1} onChange={setK} />
        <Slider label="noise level" value={noise} min={0} max={1} step={0.05} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="variance kept" value={`${(100 * kept / total).toFixed(1)}%`} />
        <Stat label="numbers stored" value={`${k * (N + T + 1)} of ${N * T}`} />
        <Stat label="error vs true signal" value={errClean.toFixed(3)} />
        <Stat label="raw data's error" value={errRaw.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The activity was made from three hidden time courses plus noise. Pink is above zero and blue below. With k = 3 the rebuilt matrix is closer to the true signal than the recording itself: truncating the SVD throws away mostly noise. Keep more components and the error creeps back up as noise returns.</p>
    </div>
  );
}
