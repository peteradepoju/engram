"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** The binomial distribution with n trials and p = λ/n approaches the Poisson distribution as n grows. */
export function BinomialPoisson() {
  const [lam, setLam] = useState(3);
  const [n, setN] = useState(6);
  const p = Math.min(1, lam / n);
  const K = Math.max(12, Math.ceil(lam + 4 * Math.sqrt(lam) + 2));
  const binom = (k: number) => { if (k > n) return 0; let c = 1; for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1); return c * p ** k * (1 - p) ** (n - k); };
  const pois = (k: number) => { let v = Math.exp(-lam); for (let i = 1; i <= k; i++) v *= lam / i; return v; };
  const ks = Array.from({ length: K + 1 }, (_, k) => k);
  const tv = 0.5 * ks.reduce((s, k) => s + Math.abs(binom(k) - pois(k)), 0) + 0.5 * Math.max(0, 1 - ks.reduce((s, k) => s + pois(k), 0));
  const W = 540, H = 220, bw = (W - 60) / (K + 1), top = Math.max(...ks.map((k) => Math.max(binom(k), pois(k)))) * 1.15;
  const Y = (v: number) => H - 30 - (v / top) * (H - 50);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Binomial and Poisson probabilities">
        {ks.map((k) => (
          <g key={k}>
            <rect x={40 + k * bw + bw * 0.15} y={Y(binom(k))} width={bw * 0.7} height={H - 30 - Y(binom(k))} fill="var(--ai)" opacity="0.75" />
            <circle cx={40 + k * bw + bw / 2} cy={Y(pois(k))} r="4.5" fill="var(--neuro)" />
            {k % (K > 20 ? 2 : 1) === 0 && <text x={40 + k * bw + bw / 2} y={H - 12} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{k}</text>}
          </g>
        ))}
        <line x1="40" x2={W - 20} y1={H - 30} y2={H - 30} stroke="var(--line)" />
        <text x={W - 12} y="18" fontSize="11" textAnchor="end" fill="var(--ai)">binomial, n = {n}, p = {p.toFixed(3)}</text>
        <text x={W - 12} y="34" fontSize="11" textAnchor="end" fill="var(--neuro)">Poisson, λ = {lam.toFixed(1)}</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="mean count λ" value={lam} min={0.5} max={10} step={0.1} onChange={setLam} fmt={(v) => v.toFixed(1)} />
        <Slider label="number of bins n (p = λ / n)" value={n} min={Math.ceil(lam)} max={200} step={1} onChange={setN} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="binomial variance np(1 − p)" value={(n * p * (1 - p)).toFixed(3)} />
        <Stat label="Poisson variance λ" value={lam.toFixed(3)} />
        <Stat label="total variation distance" value={tv.toFixed(4)} />
      </div>
      <p className="text-sm text-ink-2">Split a window into n bins and let a spike occur in each bin with probability λ/n. The count is binomial (blue bars). As the bins get finer, with the mean held at λ, the binomial probabilities converge to the Poisson probabilities (pink dots) and the variance np(1 − p) rises to λ. The total variation distance, the largest possible difference in the probability of any event, falls roughly like 1/n.</p>
    </div>
  );
}
