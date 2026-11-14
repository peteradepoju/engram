"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** The best of several cross-validation scores is optimistic, even when every candidate model is equally good. */
export function SelectionBias() {
  const [m, setM] = useState(20);
  const [n, setN] = useState(100);
  const best = useMemo(() => {
    const r = rng(591), sd = Math.sqrt(0.6 * 0.4 / n), out: number[] = [];
    for (let s = 0; s < 600; s++) {
      let b = -1;
      for (let k = 0; k < m; k++) b = Math.max(b, 0.6 + sd * gauss(r));
      out.push(Math.min(1, b));
    }
    return out;
  }, [m, n]);
  const bins = Array.from({ length: 30 }, () => 0);
  best.forEach((b) => { const i = Math.floor((b - 0.45) / 0.015); if (i >= 0 && i < 30) bins[i]++; });
  const top = Math.max(...bins), mean = best.reduce((s, b) => s + b, 0) / best.length;
  const sx = (a: number): number => 20 + ((a - 0.45) / 0.45) * 300;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Distribution of the best cross-validation score">
        {bins.map((c, i) => <rect key={i} x={sx(0.45 + i * 0.015) + 0.5} y={145 - (c / top) * 120} width={9} height={(c / top) * 120} fill="var(--ai)" opacity="0.75" />)}
        <line x1={sx(0.6)} x2={sx(0.6)} y1="18" y2="145" stroke="var(--neuro)" strokeWidth="2" />
        <text x={sx(0.6) - 3} y="16" fontSize="8" textAnchor="end" fill="var(--neuro)">true accuracy of every model</text>
        <line x1="20" x2="320" y1="145" y2="145" stroke="var(--line)" />
        {[0.5, 0.6, 0.7, 0.8, 0.9].map((a) => <text key={a} x={sx(a)} y="158" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{a.toFixed(1)}</text>)}
        <text x="320" y="168" fontSize="8" textAnchor="end" fill="var(--ink-3)">best cross-validated accuracy among the candidates</text>
      </svg>
      <Slider label="candidate models compared" value={m} min={1} max={200} step={1} onChange={setM} />
      <Slider label="trials in the cross-validation" value={n} min={40} max={1000} step={20} onChange={setN} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="average best score" value={mean.toFixed(3)} />
        <Stat label="optimism" value={`+${(mean - 0.6).toFixed(3)}`} />
      </div>
      <p className="text-sm text-ink-2">Every candidate is truly right on 60% of trials, but each cross-validation score is noisy, and the winner is the one whose noise happened to be most favourable. Reporting the winning score overstates performance, more so with many candidates and few trials. Nested cross-validation scores the selection procedure on data it never saw.</p>
    </div>
  );
}
