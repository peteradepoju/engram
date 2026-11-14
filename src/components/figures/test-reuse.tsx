"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** The best of K useless classifiers, judged on the same test set, looks better than chance. */
export function TestReuse() {
  const [K, setK] = useState(50);
  const [n, setN] = useState(200);
  const best = useMemo(() => {
    const r = rng(543), sd = Math.sqrt(0.25 / n);
    return Array.from({ length: 400 }, () => { let m = -1; for (let k = 0; k < K; k++) m = Math.max(m, 0.5 + sd * gauss(r)); return m; });
  }, [K, n]);
  const bins = Array(30).fill(0);
  best.forEach((v) => { const i = Math.floor((v - 0.4) / 0.01); if (i >= 0 && i < 30) bins[i]++; });
  const mx = Math.max(...bins), mean = best.reduce((a, b) => a + b, 0) / best.length;
  const sorted = [...best].sort((a, b) => a - b);
  const sx = (v: number): number => 20 + (v - 0.4) * 1000;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Histogram of the best test accuracy">
        {bins.map((c, i) => <rect key={i} x={20 + i * 10} y={130 - (c / mx) * 110} width="9" height={(c / mx) * 110} fill="var(--neuro)" opacity="0.8" />)}
        <line x1={sx(0.5)} x2={sx(0.5)} y1="15" y2="130" stroke="var(--ink)" strokeDasharray="3 3" />
        {[0.4, 0.5, 0.6, 0.7].map((v) => <text key={v} x={sx(v)} y="143" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{v.toFixed(1)}</text>)}
        <text x={sx(0.5) + 4} y="22" fontSize="8" fill="var(--ink)">true accuracy of every model</text>
      </svg>
      <Slider label="models compared on the test set, K" value={K} min={1} max={200} step={1} onChange={setK} />
      <Slider label="test trials" value={n} min={50} max={1000} step={10} onChange={setN} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean best test accuracy" value={mean.toFixed(3)} />
        <Stat label="95th percentile" value={sorted[Math.floor(0.95 * sorted.length)].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Every model guesses at random, so each has a true accuracy of 0.5. Reporting the best of K on the same test set selects for luck: the reported accuracy rises with K and falls back towards 0.5 only as the test set grows. A test set used to choose between models is no longer a test set.</p>
    </div>
  );
}
