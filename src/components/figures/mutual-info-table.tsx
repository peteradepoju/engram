"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Mutual information between four stimuli and a neuron's spike count, as the noise in the response changes. */
export function MutualInfoTable() {
  const [noise, setNoise] = useState(1.0);
  const S = 4, R = 12;
  const means = [1.5, 4, 6.5, 9];
  const joint = means.map((m) => { const row = Array.from({ length: R }, (_, r) => Math.exp(-((r - m) ** 2) / (2 * noise * noise))); const t = row.reduce((a, b) => a + b, 0); return row.map((v) => v / t / S); });
  const pr = Array.from({ length: R }, (_, r) => joint.reduce((a, row) => a + row[r], 0));
  const h = (v: number[]) => -v.reduce((a, x) => a + (x > 1e-12 ? x * Math.log2(x) : 0), 0);
  const HR = h(pr), HRgS = joint.reduce((a, row) => a + h(row.map((v) => v * S)) / S, 0), I = HR - HRgS;
  const W = 360, cell = (W - 60) / R, rowH = 26, top = Math.max(...joint.flat());
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${S * rowH + 70}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Joint distribution of stimulus and response">
        {joint.map((row, s) => (
          <g key={s}>
            <text x="50" y={20 + s * rowH + rowH / 2 + 4} fontSize="10" textAnchor="end" fill="var(--ink-3)">stim {s + 1}</text>
            {row.map((v, r) => <rect key={r} x={56 + r * cell} y={14 + s * rowH} width={cell + 0.5} height={rowH - 2} shapeRendering="crispEdges" fill="var(--accent)" opacity={0.05 + 0.9 * Math.sqrt(v / top)} />)}
          </g>
        ))}
        {pr.map((v, r) => <rect key={r} x={56 + r * cell + 2} y={S * rowH + 54 - (v / Math.max(...pr)) * 30} width={cell - 4} height={(v / Math.max(...pr)) * 30} fill="var(--ai)" opacity="0.7" />)}
        {Array.from({ length: R }, (_, r) => r).filter((r) => r % 2 === 0).map((r) => <text key={r} x={56 + r * cell + cell / 2} y={S * rowH + 66} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{r}</text>)}
        <text x="50" y={S * rowH + 50} fontSize="10" textAnchor="end" fill="var(--ai)">P(r)</text>
      </svg>
      <Slider label="response noise (sd of the count)" value={noise} min={0.2} max={4} step={0.05} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="H(R) bits" value={HR.toFixed(2)} />
        <Stat label="H(R | S) bits" value={HRgS.toFixed(2)} />
        <Stat label="I(S; R) bits" value={I.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Each row is the distribution of a neuron&apos;s spike count for one of four equally likely stimuli (deeper colour means more probable); the bars below are the overall distribution of counts. Mutual information is the response entropy minus the average entropy that remains once the stimulus is known: the reduction in uncertainty. With little noise the rows do not overlap and the response carries the full 2 bits needed to tell four stimuli apart; as noise grows the rows overlap and information falls towards zero.</p>
    </div>
  );
}
