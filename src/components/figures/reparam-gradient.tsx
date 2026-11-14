"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** Spread of two Monte Carlo estimators of the gradient of E_q[f(z)] with respect to the mean of q. */
export function ReparamGradient() {
  const [S, setS] = useState(10);
  const mu = 1.0, f = (z: number): number => (z - 2) ** 2, df = (z: number): number => 2 * (z - 2);
  const res = useMemo(() => {
    const r = rng(634), score: number[] = [], rep: number[] = [];
    for (let rep_ = 0; rep_ < 400; rep_++) {
      let a = 0, b = 0;
      for (let s = 0; s < S; s++) { const e = gauss(r), z = mu + e; a += (f(z) * (z - mu)) / S; b += df(z) / S; }
      score.push(a); rep.push(b);
    }
    const sd = (v: number[]): number => { const m = v.reduce((x, y) => x + y, 0) / v.length; return Math.sqrt(v.reduce((x, y) => x + (y - m) ** 2, 0) / v.length); };
    return { score, rep, sdScore: sd(score), sdRep: sd(rep) };
  }, [S]);
  const truth = 2 * (mu - 2);
  const hist = (v: number[]) => { const b = Array(40).fill(0); v.forEach((x) => { const k = Math.floor((x + 8) / 0.4); if (k >= 0 && k < 40) b[k]++; }); return b; };
  const hs = hist(res.score), hr = hist(res.rep), top = Math.max(...hs, ...hr);
  const sx = (x: number): number => 20 + ((x + 8) / 16) * 300;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Gradient estimator distributions">
        {hs.map((c, k) => <rect key={`s${k}`} x={sx(-8 + k * 0.4)} y={130 - (c / top) * 110} width="6.5" height={(c / top) * 110} fill="var(--neuro)" opacity="0.5" />)}
        {hr.map((c, k) => <rect key={`r${k}`} x={sx(-8 + k * 0.4) + 1} y={130 - (c / top) * 110} width="4.5" height={(c / top) * 110} fill="var(--ai)" opacity="0.8" />)}
        <line x1={sx(truth)} x2={sx(truth)} y1="15" y2="130" stroke="var(--ink)" strokeDasharray="3 3" />
        <line x1="20" x2="320" y1="130" y2="130" stroke="var(--line)" />
        <text x="24" y="14" fontSize="8" fill="var(--neuro)">score-function estimates</text>
        <text x="140" y="14" fontSize="8" fill="var(--ai)">reparameterised estimates</text>
        <text x={sx(truth)} y="143" fontSize="8" textAnchor="middle" fill="var(--ink-3)">true gradient</text>
      </svg>
      <Slider label="samples per estimate" value={S} min={1} max={100} step={1} onChange={setS} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="spread, score function" value={res.sdScore.toFixed(3)} />
        <Stat label="spread, reparameterised" value={res.sdRep.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Both estimators of the gradient of the expected value of (z − 2)² under q = N(1, 1) are unbiased. The score-function estimator multiplies the function's value by the gradient of log q; the reparameterised one writes z = μ + ε and differentiates through f. Using the function's slope, not just its values, makes the reparameterised estimate several times less variable.</p>
    </div>
  );
}
