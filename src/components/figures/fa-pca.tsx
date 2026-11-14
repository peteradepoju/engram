"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const LOAD = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];

/** PCA against factor analysis on a population covariance with one shared factor and unequal private noise. */
export function FaPca() {
  const [noisy, setNoisy] = useState(3);
  const res = useMemo(() => {
    const d = LOAD.length, psi = LOAD.map((_, i) => (i === 5 ? noisy : 0.3));
    const S = LOAD.map((a, i) => LOAD.map((b, j) => a * b + (i === j ? psi[i] : 0)));
    let v = Array(d).fill(1);
    for (let it = 0; it < 300; it++) { const w = S.map((row) => row.reduce((s, x, j) => s + x * v[j], 0)); const nrm = Math.hypot(...w); v = w.map((x) => x / nrm); }
    let l = Array(d).fill(0.5), p = Array(d).fill(1);
    for (let it = 0; it < 500; it++) {
      // EM for one-factor analysis on the covariance S
      const beta = l.map((li, i) => li / p[i]);
      const c = 1 / (1 + l.reduce((s, li, i) => s + li * beta[i], 0));
      const g = beta.map((b) => b * c);
      const Sg = S.map((row) => row.reduce((s, x, j) => s + x * g[j], 0));
      const ezz = c + g.reduce((s, gi, i) => s + gi * Sg[i], 0);
      l = Sg.map((x) => x / ezz);
      p = S.map((row, i) => Math.max(1e-4, row[i] - l[i] * Sg[i]));
    }
    const sgn = (u: number[]): number[] => (u.reduce((a, b) => a + b, 0) < 0 ? u.map((x) => -x) : u);
    const unit = (u: number[]): number[] => { const n = Math.hypot(...u); return sgn(u.map((x) => x / n)); };
    const truth = unit(LOAD), pc = unit(v), fa = unit(l);
    const cos = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i], 0);
    return { truth, pc, fa, cPc: cos(truth, pc), cFa: cos(truth, fa) };
  }, [noisy]);
  const bar = (vals: number[], ox: number, col: string, label: string) => (
    <g>
      {vals.map((v, i) => <rect key={i} x={ox + i * 15} y={120 - Math.max(v, 0) * 100} width="11" height={Math.abs(v) * 100} fill={col} opacity="0.85" />)}
      <text x={ox + 42} y="138" fontSize="9" textAnchor="middle" fill="var(--ink-3)">{label}</text>
    </g>
  );
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Loadings from PCA and factor analysis">
        <line x1="10" x2="330" y1="120" y2="120" stroke="var(--line)" />
        {bar(res.truth, 15, "var(--ink-3)", "true loading")}
        {bar(res.pc, 125, "var(--neuro)", "first PC")}
        {bar(res.fa, 235, "var(--ai)", "factor analysis")}
        <text x="15" y="14" fontSize="8" fill="var(--ink-3)">weights on six neurons (normalised); neuron 6 is the noisy one</text>
      </svg>
      <Slider label="private noise variance of neuron 6" value={noisy} min={0.3} max={6} step={0.1} onChange={setNoisy} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="first PC against truth (cosine)" value={res.cPc.toFixed(3)} />
        <Stat label="factor analysis against truth" value={res.cFa.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">One shared factor drives all six neurons, and each has private noise. PCA looks for the direction of greatest total variance, so a neuron with large private noise pulls the first component towards itself. Factor analysis models each neuron's private variance separately and recovers the shared loading whatever the noise.</p>
    </div>
  );
}
