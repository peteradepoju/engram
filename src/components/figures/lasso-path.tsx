"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const P = 8, N = 60, TRUE_W = [2, -1.5, 1, 0, 0, 0.5, 0, 0];

/** Lasso coefficients as the penalty falls, computed by coordinate descent with warm starts. */
export function LassoPath() {
  const [logLam, setLogLam] = useState(-0.5);
  const path = useMemo(() => {
    const r = rng(554);
    const X = Array.from({ length: N }, (): number[] => { const z = gauss(r); return Array.from({ length: P }, (_, j): number => (j < 4 ? 0.6 * z : 0) + gauss(r)); });
    const cols = Array.from({ length: P }, (_, j): number[] => X.map((row) => row[j]));
    cols.forEach((c) => { const m = c.reduce((a, b) => a + b, 0) / N; const s = Math.sqrt(c.reduce((a, b) => a + (b - m) ** 2, 0) / N); c.forEach((v, i) => { c[i] = (v - m) / s; }); });
    const y = Array.from({ length: N }, (_, i): number => cols.reduce((a, c, j) => a + c[i] * TRUE_W[j], 0) + gauss(r));
    const ym = y.reduce((a, b) => a + b, 0) / N; y.forEach((v, i) => { y[i] = v - ym; });
    const lams = Array.from({ length: 60 }, (_, k): number => Math.pow(10, 0.5 - (k * 3) / 59));
    const w = Array(P).fill(0), res = [...y], out: number[][] = [];
    for (const lam of lams) {
      for (let it = 0; it < 100; it++) for (let j = 0; j < P; j++) {
        const rho = cols[j].reduce((a, v, i) => a + v * (res[i] + v * w[j]), 0) / N;
        const nw = Math.sign(rho) * Math.max(Math.abs(rho) - lam, 0);
        if (nw !== w[j]) { cols[j].forEach((v, i) => { res[i] -= v * (nw - w[j]); }); w[j] = nw; }
      }
      out.push([...w]);
    }
    return { lams, out };
  }, []);
  const k = path.lams.reduce((b, l, i) => (Math.abs(Math.log10(l) - logLam) < Math.abs(Math.log10(path.lams[b]) - logLam) ? i : b), 0);
  const sx = (l: number): number => 30 + ((0.5 - Math.log10(l)) / 3) * 290, sy = (v: number): number => 85 - v * 32;
  const colours = ["var(--neuro)", "var(--ai)", "var(--warn)", "var(--ink-3)", "var(--ink-3)", "var(--good)", "var(--ink-3)", "var(--ink-3)"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 175" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Lasso coefficient paths">
        <line x1="30" x2="320" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {Array.from({ length: P }, (_, j) => <polyline key={j} points={path.out.map((w, i) => `${sx(path.lams[i])},${sy(w[j])}`).join(" ")} fill="none" stroke={colours[j]} strokeWidth={TRUE_W[j] !== 0 ? 2 : 1} />)}
        <line x1={sx(path.lams[k])} x2={sx(path.lams[k])} y1="10" y2="160" stroke="var(--ink)" strokeDasharray="3 3" />
        <text x="30" y="172" fontSize="8" fill="var(--ink-3)">large λ</text>
        <text x="320" y="172" fontSize="8" textAnchor="end" fill="var(--ink-3)">small λ</text>
        <text x="34" y="14" fontSize="8" fill="var(--ink-3)">coloured: features with true effects; grey: none</text>
      </svg>
      <Slider label="log₁₀ λ" value={logLam} min={-2.5} max={0.5} step={0.05} onChange={setLogLam} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="non-zero coefficients" value={String(path.out[k].filter((v) => v !== 0).length)} />
        <Stat label="coefficients (true 2, −1.5, 1, 0, 0, 0.5, 0, 0)" value={path.out[k].map((v) => v.toFixed(1)).join(" ")} />
      </div>
      <p className="text-sm text-ink-2">At a large penalty every coefficient is zero. As the penalty falls, features enter one at a time, roughly in order of their strength, and their coefficients grow towards the least-squares values. The penalty sets how many features the model uses.</p>
    </div>
  );
}
