"use client";

import { useMemo, useState } from "react";
import { rng, Stat } from "./util";

/** Gibbs sampling for a two-component Gaussian mixture: sorting spike amplitudes into two units. */
export function GibbsMixture() {
  const [iters, setIters] = useState(0);
  const run = useMemo(() => {
    const r = rng(1984), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    const x = [...Array.from({ length: 70 }, () => 60 + 8 * g()), ...Array.from({ length: 50 }, () => 95 + 8 * g())];
    const sd = 8, priorSd = 50, priorMean = 75;
    let mu = [70, 75], pi1 = 0.5;
    const hist: { mu: number[]; z: number[]; pi1: number }[] = [];
    let z: number[] = x.map(() => (r() < 0.5 ? 0 : 1));
    hist.push({ mu: [...mu], z: [...z], pi1 });
    for (let it = 0; it < 40; it++) {
      z = x.map((v) => { const l0 = (1 - pi1) * Math.exp(-((v - mu[0]) ** 2) / (2 * sd * sd)), l1 = pi1 * Math.exp(-((v - mu[1]) ** 2) / (2 * sd * sd)); return r() < l1 / (l0 + l1) ? 1 : 0; });
      mu = [0, 1].map((k) => { const xs = x.filter((_, i) => z[i] === k), prec = xs.length / (sd * sd) + 1 / (priorSd * priorSd); const m = (xs.reduce((s, v) => s + v, 0) / (sd * sd) + priorMean / (priorSd * priorSd)) / prec; return m + g() / Math.sqrt(prec); });
      const n1 = z.reduce((s, v) => s + v, 0);
      // Beta(1 + n1, 1 + n0) draw via two gamma(shape integer) sums of exponentials
      const gam = (k: number) => { let s = 0; for (let i = 0; i < k; i++) s += -Math.log(Math.max(r(), 1e-12)); return s; };
      const a = gam(1 + n1), b = gam(1 + x.length - n1); pi1 = a / (a + b);
      hist.push({ mu: [...mu], z: [...z], pi1 });
    }
    return { x, hist };
  }, []);
  const state = run.hist[Math.min(iters, run.hist.length - 1)];
  const W = 360, H = 200, lo = 30, hi = 125, X = (v: number) => 14 + ((v - lo) / (hi - lo)) * (W - 24);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Spike amplitudes assigned to two units">
        {run.x.map((v, i) => <circle key={i} cx={X(v)} cy={34 + (state.z[i] ? 66 : 0) + (i % 15) * 3.6} r="3" fill={state.z[i] ? "var(--neuro)" : "var(--ai)"} opacity="0.8" />)}
        {state.mu.map((m, k) => <line key={k} x1={X(m)} x2={X(m)} y1="20" y2={H - 40} stroke={k ? "var(--neuro)" : "var(--ai)"} strokeWidth="2.5" />)}
        <line x1="14" x2={W - 10} y1={H - 30} y2={H - 30} stroke="var(--line)" />
        {[40, 60, 80, 100, 120].map((v) => <text key={v} x={X(v)} y={H - 14} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v} µV</text>)}
        <text x="14" y="14" fontSize="10" fill="var(--ink-3)">dots: spikes by amplitude, coloured by current unit</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        <button className="btn !py-1.5" onClick={() => setIters(Math.min(40, iters + 1))}>One Gibbs sweep</button>
        <button className="btn !py-1.5" onClick={() => setIters(40)}>40 sweeps</button>
        <button className="btn !py-1.5" onClick={() => setIters(0)}>Reset</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="sweep" value={String(Math.min(iters, 40))} />
        <Stat label="unit means (µV)" value={`${state.mu[0].toFixed(0)}, ${state.mu[1].toFixed(0)}`} />
        <Stat label="fraction in unit 2" value={state.pi1.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">120 spikes from two neurons with mean amplitudes 60 and 95 µV, mixed together. Gibbs sampling alternates simple steps: given the unit means, draw each spike&apos;s unit from its posterior probability; given the assignments, draw each unit&apos;s mean from its Gaussian posterior; then draw the mixing fraction. Starting from random assignments, a few sweeps separate the units, and later sweeps wander around the posterior, expressing uncertainty about spikes in the overlap.</p>
    </div>
  );
}
