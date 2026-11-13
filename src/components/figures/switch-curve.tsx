"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

// P(choose the new block's likely side) on 0% and 6.25% contrast trials, lags -5 to 30 from 1,167 block switches
// in 18 IBL mice (public behavioural data, CC BY 4.0).
const DATA = [0.236, 0.286, 0.308, 0.321, 0.274, 0.422, 0.494, 0.559, 0.554, 0.614, 0.62, 0.598, 0.645, 0.614, 0.667, 0.643, 0.704, 0.72, 0.68, 0.682, 0.704, 0.736, 0.689, 0.682, 0.702, 0.732, 0.744, 0.715, 0.678, 0.707, 0.669, 0.687, 0.634, 0.667, 0.642, 0.63];

/** Switch-aligned choices of IBL mice against a leaky average of past choices. */
export function SwitchCurve() {
  const [alpha, setAlpha] = useState(0.2);
  const [w, setW] = useState(1.6);
  const mu = 0.55;
  const lags = DATA.map((_, i): number => i - 5);
  const model = lags.map((L): number => {
    const k = L <= 0 ? -mu : mu * (1 - 2 * Math.pow(1 - alpha, L));
    return 1 / (1 + Math.exp(-w * k));
  });
  let sse = 0;
  lags.forEach((L, i) => { if (L >= 1 && L <= 20) sse += (model[i] - DATA[i]) ** 2; });
  const sx = (L: number): number => 30 + ((L + 5) / 35) * 310, sy = (p: number): number => 160 - p * 140;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 185" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Choices around block switches">
        <line x1="30" x2="340" y1={sy(0.5)} y2={sy(0.5)} stroke="var(--line)" strokeDasharray="3 3" />
        <line x1={sx(0)} x2={sx(0)} y1={sy(0)} y2={sy(1)} stroke="var(--line)" />
        {[0, 0.5, 1].map((p) => <text key={p} x="25" y={sy(p) + 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">{p}</text>)}
        {[-5, 0, 10, 20, 30].map((L) => <text key={L} x={sx(L)} y="172" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{L}</text>)}
        <polyline points={lags.map((L, i) => `${sx(L)},${sy(model[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {DATA.map((p, i) => <circle key={i} cx={sx(lags[i])} cy={sy(p)} r="2.8" fill="var(--neuro)" />)}
        <text x="36" y="14" fontSize="8" fill="var(--neuro)">mice (hard trials)</text>
        <text x="120" y="14" fontSize="8" fill="var(--ai)">leaky average of past choices</text>
        <text x="340" y="183" fontSize="8" textAnchor="end" fill="var(--ink-3)">trials since the block switch</text>
      </svg>
      <Slider label="kernel rate α" value={alpha} min={0.02} max={0.8} step={0.01} onChange={setAlpha} fmt={(v) => v.toFixed(2)} />
      <Slider label="prior weight w" value={w} min={0} max={4} step={0.05} onChange={setW} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="squared error, lags 1 to 20" value={sse.toFixed(3)} />
        <Stat label="trials for the prior to flip" value={(Math.log(0.5) / Math.log(1 - alpha)).toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">A schematic model: the kernel averages choices that follow the block 77% of the time, and ignores the stimulus. It cannot produce the jump at lag 0, which comes from partly visible 6.25% stimuli on the first trial of the new block, nor the dip after lag 20, when some blocks have already switched back.</p>
    </div>
  );
}
