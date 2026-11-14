"use client";

import { useMemo, useState } from "react";
import { gauss, poisson, rng, Slider, Stat } from "./util";

const T = 400;

/** Baum-Welch from many random starts on a two-state Poisson HMM: the log-likelihood traces and where they end. */
export function EmStarts() {
  const [sep, setSep] = useState(3.0);
  const res = useMemo(() => {
    const r = rng(657), stay = 0.95;
    const z: number[] = [0], x: number[] = [];
    for (let t = 1; t < T; t++) z.push(r() < stay ? z[t - 1] : 1 - z[t - 1]);
    for (let t = 0; t < T; t++) x.push(poisson(z[t] ? 1 + sep : 1, r));
    const lfact = (k: number): number => { let s = 0; for (let i = 2; i <= k; i++) s += Math.log(i); return s; };
    const runs: { trace: number[]; rates: number[] }[] = [];
    for (let s = 0; s < 8; s++) {
      let rates = [0.5 + 4 * r(), 0.5 + 4 * r()];
      let A = [[0.9, 0.1], [0.1, 0.9]], pi = [0.5, 0.5];
      const trace: number[] = [];
      for (let it = 0; it < 40; it++) {
        const B = x.map((v) => rates.map((la) => Math.exp(v * Math.log(la) - la - lfact(v)) + 1e-300));
        const al: number[][] = [], c: number[] = [];
        let a0 = [pi[0] * B[0][0], pi[1] * B[0][1]];
        c.push(a0[0] + a0[1]); al.push([a0[0] / c[0], a0[1] / c[0]]);
        for (let t = 1; t < T; t++) {
          const pr = [al[t - 1][0] * A[0][0] + al[t - 1][1] * A[1][0], al[t - 1][0] * A[0][1] + al[t - 1][1] * A[1][1]];
          a0 = [B[t][0] * pr[0], B[t][1] * pr[1]];
          const cc = a0[0] + a0[1]; c.push(cc); al.push([a0[0] / cc, a0[1] / cc]);
        }
        trace.push(c.reduce((acc, v) => acc + Math.log(v), 0));
        const be: number[][] = Array.from({ length: T }, () => [1, 1]);
        for (let t = T - 2; t >= 0; t--) {
          const nb = [B[t + 1][0] * be[t + 1][0], B[t + 1][1] * be[t + 1][1]];
          be[t] = [(A[0][0] * nb[0] + A[0][1] * nb[1]) / c[t + 1], (A[1][0] * nb[0] + A[1][1] * nb[1]) / c[t + 1]];
        }
        const g = al.map((a, t) => { const u = [a[0] * be[t][0], a[1] * be[t][1]]; const sgm = u[0] + u[1]; return [u[0] / sgm, u[1] / sgm]; });
        const xi = [[0, 0], [0, 0]];
        for (let t = 1; t < T; t++) {
          let tot = 0; const cell = [[0, 0], [0, 0]];
          for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) { cell[j][k] = al[t - 1][j] * A[j][k] * B[t][k] * be[t][k]; tot += cell[j][k]; }
          for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) xi[j][k] += cell[j][k] / tot;
        }
        A = xi.map((row) => { const sgm = row[0] + row[1]; return [row[0] / sgm, row[1] / sgm]; });
        pi = g[0];
        const n0 = g.reduce((acc, u) => acc + u[0], 0), n1 = g.reduce((acc, u) => acc + u[1], 0);
        rates = [g.reduce((acc, u, t) => acc + u[0] * x[t], 0) / n0, g.reduce((acc, u, t) => acc + u[1] * x[t], 0) / n1];
      }
      runs.push({ trace, rates: rates.slice().sort((p, q) => p - q) });
    }
    const finals = runs.map((u) => u.trace[u.trace.length - 1]);
    const distinct = new Set(finals.map((v) => Math.round(v * 2) / 2)).size;
    return { runs, best: Math.max(...finals), worst: Math.min(...finals), distinct, bestRates: runs[finals.indexOf(Math.max(...finals))].rates };
  }, [sep]);
  const lo = res.worst - 5, hi = res.best + 2;
  const sx = (i: number): number => 25 + i * 7.5, sy = (v: number): number => 140 - ((Math.max(v, lo) - lo) / (hi - lo)) * 125;
  const COLS = ["var(--neuro)", "var(--ai)", "var(--warn)", "var(--good)"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="EM log-likelihood traces">
        <line x1={sx(0)} x2={sx(39)} y1={sy(res.best)} y2={sy(res.best)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        {res.runs.map((u, k) => <polyline key={k} points={u.trace.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} fill="none" stroke={COLS[k % 4]} strokeWidth="1.4" opacity="0.85" />)}
        <text x="28" y="14" fontSize="8" fill="var(--ink-3)">log-likelihood against EM iteration, 8 random starts</text>
      </svg>
      <Slider label="separation of the two firing rates" value={sep} min={0.3} max={6} step={0.1} onChange={setSep} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="best log-likelihood" value={res.best.toFixed(1)} />
        <Stat label="distinct optima" value={`${res.distinct}`} />
        <Stat label="best run's rates" value={res.bestRates.map((v) => v.toFixed(2)).join(", ")} />
      </div>
      <p className="text-sm text-ink-2">Each curve is one run of Baum-Welch from a random start. The log-likelihood never falls, but the runs do not all end in the same place: with well-separated rates almost every start finds the same optimum, and as the states become similar the runs scatter and some settle for a single effective state. The true rates are 1 and 1 plus the separation.</p>
    </div>
  );
}
