"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const DISTS: Record<string, { label: string; p: number[] }> = {
  die: { label: "fair die", p: [0, 1, 1, 1, 1, 1, 1].map((v) => v / 6) },
  counts: { label: "spike counts", p: [0.05, 0.14, 0.22, 0.22, 0.17, 0.1, 0.06, 0.03, 0.01] },
  skewed: { label: "skewed", p: [0.45, 0.25, 0.12, 0.08, 0.05, 0.03, 0.02] },
};

/** Draw samples from a discrete distribution: the histogram of relative frequencies approaches the probability mass function. */
export function SampleHistogram() {
  const [which, setWhich] = useState("counts");
  const [logN, setLogN] = useState(1.3);
  const [seed, setSeed] = useState(1);
  const n = Math.round(10 ** logN);
  const p = DISTS[which].p;
  const draws = useMemo(() => {
    const r = rng(seed * 7919 + 11), cdf = p.map((_, k) => p.slice(0, k + 1).reduce((a, b) => a + b, 0));
    return Array.from({ length: 10000 }, () => { const u = r() * cdf[cdf.length - 1]; let k = 0; while (cdf[k] < u) k++; return k; });
  }, [which, seed, p]);
  const used = draws.slice(0, n);
  const freq = p.map((_, k) => used.filter((d) => d === k).length / n);
  const mean = used.reduce((a, b) => a + b, 0) / n;
  const trueMean = p.reduce((s, v, k) => s + v * k, 0);
  const W = 540, H = 220, bw = (W - 60) / p.length, top = Math.max(...p, ...freq) * 1.15;
  const Y = (v: number) => H - 30 - (v / top) * (H - 50);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(DISTS).map(([k, d]) => (
          <button key={k} className={`btn !py-1.5 ${which === k ? "btn-primary" : ""}`} onClick={() => setWhich(k)}>{d.label}</button>
        ))}
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>New samples</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Histogram of samples against the probability mass function">
        {p.map((v, k) => (
          <g key={k}>
            <rect x={40 + k * bw + bw * 0.15} y={Y(freq[k])} width={bw * 0.7} height={H - 30 - Y(freq[k])} fill="var(--ai)" opacity="0.75" />
            <line x1={40 + k * bw + bw * 0.08} x2={40 + k * bw + bw * 0.92} y1={Y(v)} y2={Y(v)} stroke="var(--neuro)" strokeWidth="3" />
            <text x={40 + k * bw + bw / 2} y={H - 12} fontSize="11" textAnchor="middle" fill="var(--ink-3)">{k}</text>
          </g>
        ))}
        <line x1="40" x2={W - 20} y1={H - 30} y2={H - 30} stroke="var(--line)" />
        <text x={W - 12} y="18" fontSize="11" textAnchor="end" fill="var(--ai)">relative frequency in the sample</text>
        <text x={W - 12} y="34" fontSize="11" textAnchor="end" fill="var(--neuro)">true probability</text>
      </svg>
      <Slider label="number of samples" value={logN} min={0.7} max={4} step={0.05} onChange={setLogN} fmt={() => String(n)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="sample mean" value={mean.toFixed(3)} />
        <Stat label="true mean (expectation)" value={trueMean.toFixed(3)} />
        <Stat label="largest frequency error" value={Math.max(...freq.map((f, k) => Math.abs(f - p[k]))).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">A random variable is described by its distribution: the probability of each value (pink lines). Each sample is one draw. With a handful of draws the histogram (blue) is ragged; as the number of draws grows, the relative frequencies settle onto the probabilities and the sample mean onto the expectation. The errors shrink roughly like one over the square root of the number of samples, so a hundred times more data buys only ten times more precision.</p>
    </div>
  );
}
