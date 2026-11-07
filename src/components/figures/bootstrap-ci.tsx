"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The bootstrap: resample one dataset with replacement to approximate the sampling distribution of a statistic (here the median). */
export function BootstrapCI() {
  const [n, setN] = useState(20);
  const [seed, setSeed] = useState(1);
  const draw = (r: () => number) => -Math.log(Math.max(r(), 1e-12)) * 50;          // exponential latencies, mean 50 ms
  const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const trueMedian = 50 * Math.log(2);
  const { sample, boot, truth } = useMemo(() => {
    const r = rng(seed * 31 + n);
    const sample = Array.from({ length: n }, () => draw(r));
    const boot = Array.from({ length: 2000 }, () => median(Array.from({ length: n }, () => sample[Math.floor(r() * n)])));
    const truth = Array.from({ length: 2000 }, () => median(Array.from({ length: n }, () => draw(r))));
    return { sample, boot, truth };
  }, [n, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const sorted = [...boot].sort((a, b) => a - b), ci = [sorted[49], sorted[1949]];
  const W = 360, H = 210, lo = 0, hi = 120, bins = 48, bw = (hi - lo) / bins;
  const hb = new Array(bins).fill(0), ht = new Array(bins).fill(0);
  boot.forEach((v) => { const k = Math.floor((v - lo) / bw); if (k >= 0 && k < bins) hb[k]++; });
  truth.forEach((v) => { const k = Math.floor((v - lo) / bw); if (k >= 0 && k < bins) ht[k]++; });
  const top = Math.max(...hb, ...ht) * 1.1;
  const X = (v: number) => 14 + ((v - lo) / (hi - lo)) * (W - 24), Y = (c: number) => H - 26 - (c / top) * (H - 60);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Bootstrap and true sampling distributions of the median">
        <rect x={X(ci[0])} y="20" width={X(ci[1]) - X(ci[0])} height={H - 46} fill="var(--accent)" opacity="0.12" />
        {hb.map((c, k) => <rect key={k} x={X(lo + k * bw)} y={Y(c)} width={(W - 24) / bins - 1} height={H - 26 - Y(c)} fill="var(--ai)" opacity="0.7" />)}
        <polyline points={ht.map((c, k) => `${X(lo + (k + 0.5) * bw)},${Y(c)}`).join(" ")} fill="none" stroke="var(--good)" strokeWidth="2" />
        {sample.map((v, i) => <line key={i} x1={X(Math.min(v, hi))} x2={X(Math.min(v, hi))} y1="6" y2="16" stroke="var(--neuro)" strokeWidth="1.5" />)}
        <line x1={X(trueMedian)} x2={X(trueMedian)} y1="20" y2={H - 26} stroke="var(--good)" strokeDasharray="4 3" />
        <line x1="14" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[0, 20, 40, 60, 80, 100, 120].map((v) => <text key={v} x={X(v)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
        <text x="14" y={H + 8} fontSize="10" fill="var(--ai)">bars: bootstrap medians</text>
        <text x="150" y={H + 8} fontSize="10" fill="var(--good)">line: true sampling distribution</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label="sample size n" value={n} min={5} max={100} step={1} onChange={setN} />
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>New sample</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="sample median" value={`${median(sample).toFixed(1)} ms`} />
        <Stat label="95% bootstrap interval" value={`${ci[0].toFixed(0)} to ${ci[1].toFixed(0)}`} />
        <Stat label="true median" value={`${trueMedian.toFixed(1)} ms`} />
      </div>
      <p className="text-sm text-ink-2">One sample of response latencies (pink ticks at the top). To ask how much its median would vary across experiments, resample the data with replacement 2,000 times and recompute the median each time (blue bars). The spread of those bootstrap medians approximates the true sampling distribution (green line), which in a real experiment you could never see. The middle 95% of them is a percentile confidence interval (shaded).</p>
    </div>
  );
}
