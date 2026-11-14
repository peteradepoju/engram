"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** How precisely a test set of n trials measures accuracy: the binomial distribution of the score. */
export function CvVariance() {
  const [n, setN] = useState(100);
  const [acc, setAcc] = useState(0.7);
  const lg = (k: number): number => { let s = 0; for (let i = 2; i <= k; i++) s += Math.log(i); return s; };
  const pmf = Array.from({ length: n + 1 }, (_, k) => Math.exp(lg(n) - lg(k) - lg(n - k) + k * Math.log(acc) + (n - k) * Math.log(1 - acc)));
  const sd = Math.sqrt((acc * (1 - acc)) / n);
  const top = Math.max(...pmf);
  const sx = (a: number): number => 20 + a * 300;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 165" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Sampling distribution of measured accuracy">
        <rect x={sx(acc - 1.96 * sd)} y="20" width={sx(acc + 1.96 * sd) - sx(acc - 1.96 * sd)} height="125" fill="var(--ai)" opacity="0.12" />
        <polyline points={pmf.map((p, k) => `${sx(k / n)},${145 - (p / top) * 120}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1={sx(acc)} x2={sx(acc)} y1="20" y2="145" stroke="var(--neuro)" strokeWidth="1.5" />
        <line x1={sx(0.5)} x2={sx(0.5)} y1="20" y2="145" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={sx(0.5) - 3} y="30" fontSize="8" textAnchor="end" fill="var(--ink-3)">chance</text>
        <line x1="20" x2="320" y1="145" y2="145" stroke="var(--line)" />
        {[0, 0.25, 0.5, 0.75, 1].map((a) => <text key={a} x={sx(a)} y="157" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{a}</text>)}
        <text x="24" y="14" fontSize="8" fill="var(--ink-3)">measured accuracy on n test trials (shaded: 95% of measurements)</text>
      </svg>
      <Slider label="test trials" value={n} min={10} max={1000} step={10} onChange={setN} />
      <Slider label="true accuracy" value={acc} min={0.5} max={0.95} step={0.01} onChange={setAcc} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="standard error" value={sd.toFixed(3)} />
        <Stat label="95% interval" value={`${Math.max(0, acc - 1.96 * sd).toFixed(2)} to ${Math.min(1, acc + 1.96 * sd).toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">Each test trial is right or wrong, so the measured accuracy is a binomial proportion with standard error √(a(1 − a)/n). With 50 trials, two decoders differing by 5 points are indistinguishable. Cross-validation uses every trial once, but its folds share training data, so its true uncertainty is larger than this, not smaller.</p>
    </div>
  );
}
