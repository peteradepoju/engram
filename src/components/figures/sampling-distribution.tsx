"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The sampling distribution of an estimator: repeat the experiment many times and look at the spread of estimates. */
export function SamplingDistribution() {
  const [n, setN] = useState(5);
  const [divisor, setDivisor] = useState<"n" | "n-1">("n");
  const trueVar = 4;
  const ests = useMemo(() => {
    const r = rng(1922 + n), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 3000 }, () => {
      const x = Array.from({ length: n }, () => 2 * g());
      const m = x.reduce((a, b) => a + b, 0) / n;
      const ss = x.reduce((a, b) => a + (b - m) ** 2, 0);
      return { n: ss / n, n1: ss / (n - 1) };
    });
  }, [n]);
  const vals = ests.map((e) => (divisor === "n" ? e.n : e.n1));
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  const rmse = Math.sqrt(vals.reduce((a, b) => a + (b - trueVar) ** 2, 0) / vals.length);
  const W = 360, H = 190, hi = 14, bins = 56, bw = hi / bins;
  const hist = new Array(bins).fill(0);
  vals.forEach((v) => { const b = Math.floor(v / bw); if (b >= 0 && b < bins) hist[b]++; });
  const top = Math.max(...hist) * 1.1;
  const X = (v: number) => 20 + (v / hi) * (W - 30);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Histogram of variance estimates">
        {hist.map((h, b) => <rect key={b} x={X(b * bw)} y={H - 26 - (h / top) * (H - 46)} width={(W - 30) / bins - 0.8} height={(h / top) * (H - 46)} fill="var(--ai)" opacity="0.75" />)}
        <line x1={X(trueVar)} x2={X(trueVar)} y1="14" y2={H - 26} stroke="var(--good)" strokeWidth="2" />
        <line x1={X(mean)} x2={X(mean)} y1="14" y2={H - 26} stroke="var(--neuro)" strokeWidth="2" strokeDasharray="5 3" />
        <line x1="20" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => <text key={v} x={X(v)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
        <text x={W - 10} y="16" fontSize="10" textAnchor="end" fill="var(--good)">true variance 4</text>
        <text x={W - 10} y="29" fontSize="10" textAnchor="end" fill="var(--neuro)">average estimate</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        {(["n", "n-1"] as const).map((d) => <button key={d} className={`btn !py-1.5 ${divisor === d ? "btn-primary" : ""}`} onClick={() => setDivisor(d)}>divide by {d}</button>)}
      </div>
      <Slider label="sample size n" value={n} min={2} max={40} step={1} onChange={setN} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="bias" value={(mean - trueVar).toFixed(2)} />
        <Stat label="standard error" value={sd.toFixed(2)} />
        <Stat label="root mean squared error" value={rmse.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Each of 3,000 imaginary experiments draws n values from a distribution with variance 4 and estimates the variance. The histogram is the estimator&apos;s sampling distribution. Dividing the sum of squared deviations by n gives estimates that are too small on average (biased), most of all when n is small; dividing by n − 1 removes the bias. Notice that the biased estimator is also a little less variable: unbiased is not the same as best.</p>
    </div>
  );
}
