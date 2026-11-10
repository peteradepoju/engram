"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

/** 95% intervals for a Poisson firing rate from n trials, by the normal approximation and by a Bayesian posterior, and how often each contains the true rate. */
export function IntervalCoverage() {
  const [rate, setRate] = useState(2);
  const [n, setN] = useState(5);
  const { rows, covN, covB } = useMemo(() => {
    const r = rng(1922 + n * 7 + Math.round(rate * 10)), reps = 400;
    const gq = (shape: number, scale: number, z: number) => { const v = 1 / (9 * shape); return shape * scale * (1 - v + z * Math.sqrt(v)) ** 3; };   // Wilson-Hilferty
    const rows: { lo: number; hi: number; blo: number; bhi: number }[] = []; let cn = 0, cb = 0;
    for (let i = 0; i < reps; i++) {
      let s = 0; for (let k = 0; k < n; k++) s += poisson(rate, r);
      const m = s / n, se = Math.sqrt(m / n);
      const lo = m - 1.96 * se, hi = m + 1.96 * se;
      const blo = gq(s + 0.5, 1 / n, -1.96), bhi = gq(s + 0.5, 1 / n, 1.96);     // Jeffreys prior, Gamma(s + ½, n) posterior
      if (lo <= rate && rate <= hi) cn++; if (blo <= rate && rate <= bhi) cb++;
      if (i < 40) rows.push({ lo, hi, blo, bhi });
    }
    return { rows, covN: cn / reps, covB: cb / reps };
  }, [rate, n]);
  const top = Math.max(rate * 3, ...rows.map((x) => x.bhi)) * 1.05;
  const W = 360, H = 220, X = (v: number) => 20 + (Math.max(0, v) / top) * (W - 30);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Forty simulated 95 percent intervals for a firing rate">
        <line x1={X(rate)} x2={X(rate)} y1="6" y2={H - 14} stroke="var(--ink)" strokeDasharray="3 3" />
        {rows.map((x, i) => { const y = 10 + i * 5, missN = x.lo > rate || x.hi < rate, missB = x.blo > rate || x.bhi < rate; return (
          <g key={i}>
            <line x1={X(x.lo)} x2={X(x.hi)} y1={y} y2={y} stroke={missN ? "var(--bad)" : "var(--ai)"} strokeWidth="1.6" />
            <line x1={X(x.blo)} x2={X(x.bhi)} y1={y + 2} y2={y + 2} stroke={missB ? "var(--bad)" : "var(--neuro)"} strokeWidth="1.6" />
          </g>); })}
        <text x={W - 10} y={H - 2} fontSize="9" textAnchor="end" fill="var(--ink-3)">rate (spikes per trial) · red: missed the truth</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="true rate (spikes per trial)" value={rate} min={0.2} max={10} step={0.1} onChange={setRate} />
        <Slider label="trials n" value={n} min={1} max={50} step={1} onChange={setN} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="normal approximation covers" value={`${(covN * 100).toFixed(0)}%`} />
        <Stat label="Bayesian (Jeffreys) covers" value={`${(covB * 100).toFixed(0)}%`} />
      </div>
      <p className="text-sm text-ink-2">Each pair of lines is one simulated experiment of n trials: blue, the textbook interval mean ± 1.96 standard errors (Weeks 17 and 18); pink, the central 95% of a Bayesian posterior (Week 19). Both are meant to contain the true rate 95% of the time. With few spikes the normal approximation often fails, sometimes reaching below zero, while the posterior interval stays close to its promise. With plenty of data they agree.</p>
    </div>
  );
}
