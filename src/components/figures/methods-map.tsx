"use client";

import { useState } from "react";

// Approximate spatial and temporal resolution of common methods (log10 metres, log10 seconds): rough ranges for orientation only.
const METHODS = [
  { name: "Patch clamp", s: [-6, -4.5], t: [-4.5, 3], c: "var(--neuro)", note: "Membrane voltage or current of one cell, sub-millisecond, for minutes to an hour." },
  { name: "Single units", s: [-5, -3.5], t: [-3.5, 4], c: "var(--neuro)", note: "Spikes of individual neurons from extracellular electrodes; Neuropixels records hundreds at once." },
  { name: "LFP", s: [-4, -2.5], t: [-3, 4], c: "var(--ai)", note: "Low-frequency voltage, dominated by synaptic currents near the electrode." },
  { name: "Calcium imaging", s: [-5.5, -2.7], t: [-1.5, 4.5], c: "var(--good)", note: "Fluorescence of calcium indicators in hundreds to thousands of identified cells; slower than spikes." },
  { name: "ECoG", s: [-3, -1.5], t: [-3, 3.5], c: "var(--ai)", note: "Electrodes on the cortical surface, usually in patients undergoing surgery." },
  { name: "EEG / MEG", s: [-2, -0.7], t: [-3, 4], c: "var(--warn)", note: "Scalp electric or magnetic fields from synchronous activity of many aligned neurons; millisecond timing, centimetre blur." },
  { name: "fMRI", s: [-3, -0.7], t: [0, 4], c: "var(--warn)", note: "Blood oxygenation (BOLD), a slow, indirect correlate of activity at millimetre resolution over the whole brain." },
];

/** Methods for measuring brain activity, placed by spatial and temporal resolution. Tap one. */
export function MethodsMap() {
  const [sel, setSel] = useState("fMRI");
  const m = METHODS.find((x) => x.name === sel)!;
  const W = 360, H = 250, X = (lt: number) => 40 + ((lt + 5) / 10) * (W - 50), Y = (ls: number) => H - 26 - ((ls + 6.5) / 6.5) * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Methods for recording brain activity placed by spatial and temporal scale">
        {[-3, 0, 3].map((e) => <text key={e} x={X(e)} y={H - 10} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{e === -3 ? "1 ms" : e === 0 ? "1 s" : "1000 s"}</text>)}
        {[-6, -3, 0].map((e) => <text key={e} x="36" y={Y(e) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{e === -6 ? "1 μm" : e === -3 ? "1 mm" : "1 m"}</text>)}
        {METHODS.map((x) => (
          <g key={x.name} onClick={() => setSel(x.name)} style={{ cursor: "pointer" }}>
            <rect x={X(x.t[0])} y={Y(x.s[1])} width={X(x.t[1]) - X(x.t[0])} height={Y(x.s[0]) - Y(x.s[1])} rx="6" fill={x.c} opacity={x.name === sel ? 0.45 : 0.15} stroke={x.c} />
            <text x={X(x.t[0]) + 4} y={Y(x.s[1]) + 11} fontSize="9" fill="var(--ink)">{x.name}</text>
          </g>
        ))}
        <text x={W - 10} y={H - 24} fontSize="9" textAnchor="end" fill="var(--ink-3)">timescale →</text>
        <text x="44" y="16" fontSize="9" fill="var(--ink-3)">↑ spatial scale</text>
      </svg>
      <div className="rounded-lg bg-surface-2 p-3 text-sm"><span className="font-semibold">{m.name}.</span> <span className="text-ink-2">{m.note}</span></div>
      <p className="text-sm text-ink-2">Every method trades spatial against temporal resolution, coverage against detail, and invasiveness against what it can see. The boxes are rough: each spans the smallest structure it resolves to the largest region it covers, and the fastest event it resolves to the longest recording. Questions that cross scales need several methods, or models that link them.</p>
    </div>
  );
}
