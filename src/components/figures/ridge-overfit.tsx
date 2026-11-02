"use client";

import { useMemo, useState } from "react";
import { rng } from "./util";
import { ridge, matvec } from "./linalg";

/** Decoding a stimulus from N neurons with 60 training trials. Too many neurons and too little regularisation overfit. */
export function RidgeOverfit() {
  const [lam, setLam] = useState(0);
  const sizes = [2, 5, 10, 20, 30, 40, 50, 55, 58];
  const data = useMemo(() => {
    const r = rng(9);
    const gauss = () => { const u = Math.max(r(), 1e-9), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const N = 60, nTr = 60, nTe = 200;
    const w = Array.from({ length: N }, () => gauss() * 0.3);
    const make = (n: number) => {
      const y = Array.from({ length: n }, gauss);
      const X = y.map((s) => w.map((wi) => wi * s + gauss()));
      return { X, y };
    };
    return { tr: make(nTr), te: make(nTe) };
  }, []);
  const curves = useMemo(() => sizes.map((k) => {
    const Xtr = data.tr.X.map((row) => row.slice(0, k)), Xte = data.te.X.map((row) => row.slice(0, k));
    const beta = ridge(Xtr, data.tr.y, lam);
    const mse = (X: number[][], y: number[]) => { const p = matvec(X, beta); return p.reduce((s, v, i) => s + (v - y[i]) ** 2, 0) / y.length; };
    return { k, train: mse(Xtr, data.tr.y), test: mse(Xte, data.te.y) };
  }), [data, lam]);
  const W = 560, H = 244, X = (k: number) => 50 + (k / 60) * 490, Y = (e: number) => 200 - Math.min(e, 2) / 2 * 180;
  const path = (key: "train" | "test") => curves.map((c, i) => `${i ? "L" : "M"}${X(c.k)},${Y(c[key])}`).join("");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Training and test error against number of neurons">
        <rect x="50" y="20" width="490" height="180" fill="var(--surface-2)" rx="4" />
        <line x1="50" x2="540" y1={Y(1)} y2={Y(1)} stroke="var(--ink-3)" strokeDasharray="4 3" />
        <text x="536" y={Y(1) - 4} fontSize="10" textAnchor="end" fill="var(--ink-3)">always guessing 0</text>
        <path d={path("train")} fill="none" stroke="var(--ai)" strokeWidth="2.5" />
        <path d={path("test")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        {curves.map((c) => <g key={c.k}><circle cx={X(c.k)} cy={Y(c.train)} r="3.5" fill="var(--ai)" /><circle cx={X(c.k)} cy={Y(c.test)} r="3.5" fill="var(--neuro)" /></g>)}
        {[0, 20, 40, 60].map((k) => <text key={k} x={X(k)} y="216" fontSize="10" textAnchor="middle" fill="var(--ink-3)">{k}</text>)}
        {[0, 1, 2].map((e) => <text key={e} x="44" y={Y(e) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)">{e}</text>)}
        <text x="295" y="236" fontSize="10" textAnchor="middle" fill="var(--ink-3)">number of neurons used (60 training trials)</text>
        <text x="60" y="34" fontSize="11" fill="var(--ai)">training error</text>
        <text x="60" y="48" fontSize="11" fill="var(--neuro)">test error</text>
      </svg>
      <label className="block text-sm"><span className="flex justify-between text-ink-2"><span>Ridge penalty λ</span><span className="font-mono text-ink">{lam}</span></span>
        <input type="range" min={0} max={60} step={1} value={lam} onChange={(e) => setLam(Number(e.target.value))} className="mt-1 w-full accent-[var(--accent)]" /></label>
      <p className="text-sm text-ink-2">With λ = 0 (ordinary least squares), training error keeps falling as you add neurons, but test error rises sharply as the number of neurons approaches the number of trials: the decoder memorises noise. Raise λ and the test error comes back down. Errors are mean squared errors; the dashed line is the error of always guessing zero, the mean stimulus.</p>
    </div>
  );
}
