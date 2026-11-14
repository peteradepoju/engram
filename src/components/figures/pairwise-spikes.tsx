"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const N = 40;

/** Probability of K simultaneous spikes in a population: weak pairwise couplings against independence. */
export function PairwiseSpikes() {
  const [J, setJ] = useState(0.05);
  const h = -2.5;
  const lgamma = (k: number): number => { let s = 0; for (let i = 2; i <= k; i++) s += Math.log(i); return s; };
  const logC = (k: number): number => lgamma(N) - lgamma(k) - lgamma(N - k);
  const lw = Array.from({ length: N + 1 }, (_, k) => logC(k) + h * k + (J * k * (k - 1)) / 2);
  const mx = Math.max(...lw), Z = lw.reduce((s, v) => s + Math.exp(v - mx), 0);
  const pPair = lw.map((v) => Math.exp(v - mx) / Z);
  const mean = pPair.reduce((s, p, k) => s + p * k, 0), q = mean / N;
  const pInd = Array.from({ length: N + 1 }, (_, k) => Math.exp(logC(k) + k * Math.log(q) + (N - k) * Math.log(1 - q)));
  const pairCorr = (() => {
    const e2 = pPair.reduce((s, p, k) => s + p * k * (k - 1), 0) / (N * (N - 1));
    return (e2 - q * q) / (q * (1 - q));
  })();
  const sy = (p: number): number => 140 - (Math.max(Math.log10(Math.max(p, 1e-12)), -10) + 10) * 13;
  const sx = (k: number): number => 20 + k * 7.5;
  const k10 = 15;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Distribution of synchronous spikes">
        <polyline points={pInd.map((p, k) => `${sx(k)},${sy(p)}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="4 3" />
        <polyline points={pPair.map((p, k) => `${sx(k)},${sy(p)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        {[0, -2, -4, -6, -8, -10].map((e) => <text key={e} x="4" y={sy(10 ** e) + 3} fontSize="7" fill="var(--ink-3)">{e === 0 ? "1" : `1e${e}`}</text>)}
        <text x="320" y="155" fontSize="8" textAnchor="end" fill="var(--ink-3)">number of neurons spiking together (of 40)</text>
        <text x="200" y="20" fontSize="8" fill="var(--neuro)">pairwise model</text>
        <text x="200" y="31" fontSize="8" fill="var(--ink-3)">independent, same rates</text>
      </svg>
      <Slider label="pairwise coupling J" value={J} min={0} max={0.12} step={0.005} onChange={setJ} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="correlation between two neurons" value={pairCorr.toFixed(3)} />
        <Stat label={`P(${k10} or more together): pairwise / independent`} value={(pPair.slice(k10).reduce((a, b) => a + b, 0) / Math.max(pInd.slice(k10).reduce((a, b) => a + b, 0), 1e-300)).toExponential(1)} />
      </div>
      <p className="text-sm text-ink-2">Forty neurons, each firing in about one time bin in twelve when uncoupled; the independent model is given the same rate as the coupled one. Pairwise correlations of a few hundredths look negligible, yet they make large synchronous events orders of magnitude more likely than independence predicts. This is Schneidman and colleagues' point: weak pairwise correlations can imply strongly correlated network states.</p>
    </div>
  );
}
