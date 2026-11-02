"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The quantal model of transmitter release: n sites, each releasing one quantum with probability p. */
export function BinomialRelease() {
  const [n, setN] = useState(6);
  const [p, setP] = useState(0.3);
  const [spread, setSpread] = useState(0.15);
  const q = 0.4;
  const amps = useMemo(() => {
    const r = rng(1954), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 400 }, () => {
      let a = 0.03 * g();
      for (let i = 0; i < n; i++) if (r() < p) a += q * (1 + spread * g());
      return a;
    });
  }, [n, p, spread]);
  const W = 540, H = 220, maxA = q * (n + 1), bins = 60, bw = (W - 60) / bins;
  const hist = new Array(bins).fill(0);
  amps.forEach((a) => { const b = Math.floor(((a + 0.1) / (maxA + 0.1)) * bins); if (b >= 0 && b < bins) hist[b]++; });
  const top = Math.max(...hist) * 1.1;
  const xOf = (a: number) => 40 + ((a + 0.1) / (maxA + 0.1)) * (W - 60);
  const binom = (k: number) => { let c = 1; for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1); return c * p ** k * (1 - p) ** (n - k); };
  const bmax = Math.max(...Array.from({ length: n + 1 }, (_, j) => binom(j)));
  const mean = amps.reduce((s, a) => s + a, 0) / amps.length;
  const failures = amps.filter((a) => a < q / 2).length / amps.length;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Histogram of synaptic response amplitudes">
        {hist.map((h, b) => <rect key={b} x={40 + b * bw} y={H - 30 - (h / top) * (H - 50)} width={bw - 1} height={(h / top) * (H - 50)} fill="var(--ai)" opacity="0.75" />)}
        {Array.from({ length: n + 1 }, (_, k) => (
          <g key={k}>
            <text x={xOf(k * q)} y={H - 12} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{k}q</text>
            <circle cx={xOf(k * q)} cy={H - 30 - (binom(k) / bmax) * (H - 70)} r="4" fill="var(--neuro)" />
            {binom(k) > 0.005 && <text x={xOf(k * q) + 6} y={H - 34 - (binom(k) / bmax) * (H - 70)} fontSize="9" fill="var(--neuro)">{Math.round(binom(k) * 100)}%</text>}
          </g>
        ))}
        <line x1="40" x2={W - 20} y1={H - 30} y2={H - 30} stroke="var(--line)" />
        <text x={W - 12} y="18" fontSize="11" textAnchor="end" fill="var(--ai)">amplitudes on 400 trials</text>
        <text x={W - 12} y="34" fontSize="11" textAnchor="end" fill="var(--neuro)">binomial probability of k quanta (own scale)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="release sites n" value={n} min={1} max={12} step={1} onChange={setN} />
        <Slider label="release probability p" value={p} min={0.02} max={0.95} step={0.01} onChange={setP} fmt={(v) => v.toFixed(2)} />
        <Slider label="quantal variability" value={spread} min={0} max={0.5} step={0.01} onChange={setSpread} fmt={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="mean amplitude (npq in brackets)" value={`${mean.toFixed(3)} (${(n * p * q).toFixed(3)})`} />
        <Stat label="failures, measured" value={failures.toFixed(3)} />
        <Stat label="failures, (1 − p)ⁿ" value={((1 - p) ** n).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each of n release sites releases one packet (quantum) of size q with probability p, independently, so the number released is binomial. The response histogram has peaks at whole multiples of q, and the fraction of trials in each peak follows the binomial probability of that many quanta (pink dots, labelled). Later peaks are wider, because the variability of several quanta adds up. With low p most trials are failures, as del Castillo and Katz saw at the frog neuromuscular junction in low calcium. Raise the quantal variability and the peaks blur together, which is why quantal analysis is hard at central synapses.</p>
    </div>
  );
}
