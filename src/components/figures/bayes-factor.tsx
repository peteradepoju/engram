"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const lchoose = (n: number, k: number) => { let s = 0; for (let i = 1; i <= k; i++) s += Math.log((n - k + i) / i); return s; };

/** Bayes factors and Occam's razor: a simple model (p = 0.5) against a flexible one (p uniform), for k successes in n trials. */
export function BayesFactor() {
  const [n, setN] = useState(20);
  const [k, setK] = useState(14);
  const kk = Math.min(k, n);
  const ev0 = (j: number) => Math.exp(lchoose(n, j) + n * Math.log(0.5));   // P(k | p = 0.5)
  const ev1 = () => 1 / (n + 1);                                              // P(k | p ~ Uniform) is the same for every k
  const ks = Array.from({ length: n + 1 }, (_, j) => j);
  const top = Math.max(...ks.map(ev0), ev1()) * 1.15;
  const W = 360, H = 190, bw = (W - 40) / (n + 1);
  const X = (j: number) => 30 + j * bw, Y = (v: number) => H - 26 - (v / top) * (H - 40);
  const bf = ev1() / ev0(kk);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Evidence for a simple and a flexible model">
        {ks.map((j) => <rect key={j} x={X(j) + 1} y={Y(ev0(j))} width={bw - 2} height={H - 26 - Y(ev0(j))} fill={j === kk ? "var(--neuro)" : "var(--ink-3)"} opacity={j === kk ? 0.9 : 0.45} />)}
        <line x1="30" x2={W - 10} y1={Y(ev1())} y2={Y(ev1())} stroke="var(--ai)" strokeWidth="2.5" />
        <line x1="30" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {ks.filter((j) => j % Math.ceil((n + 1) / 10) === 0).map((j) => <text key={j} x={X(j) + bw / 2} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{j}</text>)}
        <text x="30" y={H + 8} fontSize="10" fill="var(--ink-3)">bars: P(k | fair, p = 0.5)</text>
        <text x="190" y={H + 8} fontSize="10" fill="var(--ai)">line: P(k | p unknown)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="trials n" value={n} min={4} max={100} step={1} onChange={(v) => { setN(v); if (k > v) setK(v); }} />
        <Slider label="successes k observed" value={kk} min={0} max={n} step={1} onChange={setK} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="evidence, fair model" value={ev0(kk).toExponential(2)} />
        <Stat label="evidence, flexible model" value={ev1().toExponential(2)} />
        <Stat label="Bayes factor flexible : fair" value={bf >= 100 ? bf.toExponential(1) : bf.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Each model spreads one unit of probability over the possible outcomes before seeing data. The fair model (p = 0.5) concentrates it near k = n/2; the flexible model (p anywhere from 0 to 1, uniformly) spreads it evenly, 1/(n + 1) for each k. If the data land near the middle, the simple model predicted them better and wins; only clearly lopsided data favour the flexible model. This automatic penalty on flexibility is the Bayesian Occam&apos;s razor.</p>
    </div>
  );
}
