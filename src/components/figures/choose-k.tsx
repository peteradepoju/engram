"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const npdf = (x: number, m: number, s: number): number => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

function fitGmm(x: number[], K: number): number {
  const n = x.length, sorted = x.slice().sort((a, b) => a - b);
  let w = Array(K).fill(1 / K), m = Array.from({ length: K }, (_, k) => sorted[Math.floor(((k + 0.5) / K) * n)]), s = Array(K).fill(1);
  let ll = 0;
  for (let it = 0; it < 80; it++) {
    const R = x.map((v) => { const p = w.map((wk, k) => wk * npdf(v, m[k], s[k]) + 1e-300); const t = p.reduce((a, b) => a + b, 0); return p.map((q) => q / t); });
    ll = x.reduce((a, v) => a + Math.log(w.reduce((b, wk, k) => b + wk * npdf(v, m[k], s[k]), 0) + 1e-300), 0);
    const nk = w.map((_, k) => R.reduce((a, r) => a + r[k], 0) + 1e-9);
    m = nk.map((c, k) => x.reduce((a, v, i) => a + R[i][k] * v, 0) / c);
    s = nk.map((c, k) => Math.max(0.05, Math.sqrt(x.reduce((a, v, i) => a + R[i][k] * (v - m[k]) ** 2, 0) / c)));
    w = nk.map((c) => c / n);
  }
  return ll;
}

/** Choosing the number of mixture components with the Bayesian information criterion. */
export function ChooseK() {
  const [trueK, setTrueK] = useState(3);
  const [n, setN] = useState(200);
  const bic = useMemo(() => {
    const r = rng(603 + trueK);
    const x = Array.from({ length: n }, (_, i): number => 2.2 * (i % trueK) + 0.6 * gauss(r));
    return [1, 2, 3, 4, 5, 6, 7].map((K) => -2 * fitGmm(x, K) + (3 * K - 1) * Math.log(n));
  }, [trueK, n]);
  const best = bic.indexOf(Math.min(...bic)) + 1;
  const lo = Math.min(...bic), hi = Math.max(...bic);
  const sx = (K: number): number => 30 + (K - 1) * 45, sy = (b: number): number => 140 - ((b - lo) / (hi - lo + 1e-9)) * 115;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 165" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="BIC against number of components">
        <polyline points={bic.map((b, i) => `${sx(i + 1)},${sy(b)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {bic.map((b, i) => <circle key={i} cx={sx(i + 1)} cy={sy(b)} r={i + 1 === best ? 5 : 3} fill={i + 1 === best ? "var(--neuro)" : "var(--ai)"} />)}
        {bic.map((_, i) => <text key={i} x={sx(i + 1)} y="158" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{i + 1}</text>)}
        <text x="30" y="14" fontSize="8" fill="var(--ink-3)">BIC (lower is better) against number of components</text>
      </svg>
      <Slider label="true number of groups" value={trueK} min={1} max={5} step={1} onChange={setTrueK} />
      <Slider label="number of points" value={n} min={30} max={600} step={10} onChange={setN} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="BIC chooses" value={`${best} components`} />
        <Stat label="truth" value={`${trueK} groups`} />
      </div>
      <p className="text-sm text-ink-2">More components always raise the likelihood; BIC charges each extra parameter log n. With well-separated groups and enough points, it finds the true number. With few points it prefers fewer components, because it cannot yet tell a real group from a fluctuation.</p>
    </div>
  );
}
