"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

function phi(x: number) {
  const z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.3275911 * z);
  const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
  return 0.5 * (1 + (x >= 0 ? e : -e));
}

/** False positive rate of a z-test across neurons when animals differ: the naive statistic is inflated by the square root of the design effect 1 + (m - 1)ρ. */
export function Pseudoreplication() {
  const [m, setM] = useState(120);
  const [sdMouse, setSdMouse] = useState(0.3);
  const icc = sdMouse ** 2 / (sdMouse ** 2 + 1);
  const de = 1 + (m - 1) * icc;
  const fpr = 2 * (1 - phi(1.96 / Math.sqrt(de)));
  const W = 360, H = 150;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="False positive rates of two tests">
        {[["t-test across neurons", fpr, "var(--bad)"], ["test across animals", 0.05, "var(--good)"]].map(([label, v, col], i) => (
          <g key={label as string}>
            <text x="12" y={30 + i * 58} fontSize="10" fill="var(--ink-2)">{label as string}</text>
            <rect x="12" y={42 + i * 58} width={Math.max(2, (v as number) * 320)} height="16" rx="2" fill={col as string} />
            <text x={18 + (v as number) * 320} y={54 + i * 58} fontSize="10" fill="var(--ink)">{Math.round((v as number) * 100)}%</text>
          </g>
        ))}
        <line x1={12 + 0.05 * 320} x2={12 + 0.05 * 320} y1="20" y2={H - 10} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={16 + 0.05 * 320} y={H - 8} fontSize="8" fill="var(--ink-3)">nominal 5%</text>
      </svg>
      <Slider label="neurons per animal" value={m} min={1} max={500} step={1} onChange={setM} />
      <Slider label="spread between animals (relative to neurons)" value={sdMouse} min={0} max={1} step={0.01} onChange={setSdMouse} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="ICC" value={icc.toFixed(3)} />
        <Stat label="design effect" value={de.toFixed(1)} />
        <Stat label="effective neurons per animal" value={(m / de).toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">With no true difference between groups, the test across animals is wrong 5% of the time by design. The test across neurons treats the animal-to-animal spread as if it shrank with every neuron added, so its error rate climbs with both the spread and the number of neurons per animal. With one neuron per animal the two tests agree; with hundreds, even a tiny spread makes false positives almost certain.</p>
    </div>
  );
}
