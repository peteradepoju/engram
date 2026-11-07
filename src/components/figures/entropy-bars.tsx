"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Entropy of a distribution over n outcomes, from certain (0 bits) to uniform (log2 n bits). */
export function EntropyBars() {
  const [n, setN] = useState(8);
  const [peak, setPeak] = useState(1.0);
  const raw = Array.from({ length: n }, (_, i) => Math.exp(-peak * i));
  const s = raw.reduce((a, b) => a + b, 0), p = raw.map((v) => v / s);
  const H = -p.reduce((a, v) => a + (v > 0 ? v * Math.log2(v) : 0), 0);
  const W = 360, HH = 170, bw = (W - 40) / n;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${HH}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="A probability distribution and its entropy">
        {p.map((v, i) => (
          <g key={i}>
            <rect x={30 + i * bw + 3} y={HH - 26 - v * (HH - 44)} width={bw - 6} height={v * (HH - 44)} fill="var(--ai)" opacity="0.8" />
            <text x={30 + i * bw + bw / 2} y={HH - 30 - v * (HH - 44)} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{v.toFixed(2)}</text>
            <text x={30 + i * bw + bw / 2} y={HH - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{i}</text>
          </g>
        ))}
        <line x1="30" x2={W - 10} y1={HH - 26} y2={HH - 26} stroke="var(--line)" />
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="number of outcomes n" value={n} min={2} max={16} step={1} onChange={setN} />
        <Slider label="concentration (0 = uniform)" value={peak} min={0} max={4} step={0.05} onChange={setPeak} fmt={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="entropy H (bits)" value={H.toFixed(3)} />
        <Stat label="maximum log₂ n" value={Math.log2(n).toFixed(3)} />
        <Stat label="most likely outcome" value={`p = ${p[0].toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">Entropy is the average surprise, −Σ p log₂ p, measured in bits: the average number of yes-or-no questions needed to find out which outcome occurred. A uniform distribution over n outcomes is the most uncertain, log₂ n bits; concentrating probability on one outcome lowers the entropy towards zero, when there is nothing left to learn.</p>
    </div>
  );
}
