"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

/** The log-likelihood of a Poisson rate given n trials of spike counts: its peak is the MLE and its curvature sets the error bar. */
export function LikelihoodCurve() {
  const [n, setN] = useState(5);
  const [seed, setSeed] = useState(1);
  const trueRate = 6;
  const counts = useMemo(() => { const r = rng(seed * 17 + 3); return Array.from({ length: 200 }, () => poisson(trueRate, r)); }, [seed]);
  const k = counts.slice(0, n), S = k.reduce((a, b) => a + b, 0);
  const mle = Math.max(S / n, 0.05);
  const ll = (l: number) => S * Math.log(l) - n * l;
  const lo = 1, hi = 14, W = 360, H = 190, HH = 222;
  const xs = Array.from({ length: 201 }, (_, i) => lo + (i / 200) * (hi - lo));
  const top = ll(mle), bottom = top - 12;
  const X = (l: number) => 26 + ((l - lo) / (hi - lo)) * (W - 36), Y = (v: number) => 14 + ((top - Math.max(v, bottom)) / (top - bottom)) * (H - 40);
  const fisher = n / mle, se = 1 / Math.sqrt(fisher);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${HH}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Poisson log-likelihood curve">
        <rect x={X(Math.max(lo, mle - 1.96 * se))} y="14" width={X(Math.min(hi, mle + 1.96 * se)) - X(Math.max(lo, mle - 1.96 * se))} height={H - 40} fill="var(--accent)" opacity="0.12" />
        <polyline points={xs.map((l) => `${X(l)},${Y(ll(l))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.5" />
        <line x1={X(mle)} x2={X(mle)} y1="14" y2={H - 26} stroke="var(--neuro)" strokeWidth="2" />
        <line x1={X(trueRate)} x2={X(trueRate)} y1="14" y2={H - 26} stroke="var(--good)" strokeDasharray="4 3" />
        <line x1="26" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[2, 4, 6, 8, 10, 12, 14].map((v) => <text key={v} x={X(v)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
        <text x="26" y={H + 8} fontSize="10" fill="var(--neuro)">MLE = mean count</text>
        <text x="130" y={H + 8} fontSize="10" fill="var(--good)">true rate 6</text>
        <text x="26" y={H + 24} fontSize="10" fill="var(--accent)">shaded: MLE ± 1.96 / √(Fisher information)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label="trials recorded n" value={n} min={1} max={200} step={1} onChange={setN} />
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>New data</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="MLE of the rate" value={mle.toFixed(2)} />
        <Stat label="Fisher information n/λ" value={fisher.toFixed(2)} />
        <Stat label="standard error" value={se.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The blue curve is the log-likelihood of each possible rate given the counts (it is shown down to 12 units below its peak). Its peak, the maximum likelihood estimate, is the mean count. With more trials the curve becomes sharper: its curvature at the peak, the Fisher information, grows in proportion to n, and the shaded interval, which comes from that curvature, shrinks like 1/√n.</p>
    </div>
  );
}
