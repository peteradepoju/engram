"use client";

import { useState } from "react";

const AXES = [
  { name: "neurons", n: 5, color: "var(--neuro)" },
  { name: "trials", n: 4, color: "var(--accent)" },
  { name: "time bins", n: 8, color: "var(--ai)" },
];

/** A recording as a 3D array. Pick an axis to collapse and see the shape that is left. */
export function ArrayShape() {
  const [reduce, setReduce] = useState<number | null>(null);
  const shape = AXES.map((a) => a.n);
  const left = AXES.filter((_, i) => i !== reduce);
  const cell = 22, dx = 9, dy = -7;
  const [N, K, T] = shape;
  const cubes = [];
  for (let k = K - 1; k >= 0; k--)
    for (let n = 0; n < N; n++)
      for (let t = 0; t < T; t++) {
        const x = 40 + t * cell + k * dx * 2.2, y = 60 + n * cell + k * dy * 2.2;
        const faded = reduce === 0 ? n > 0 : reduce === 1 ? k > 0 : reduce === 2 ? t > 0 : false;
        cubes.push(<rect key={`${k}-${n}-${t}`} x={x} y={y} width={cell - 2} height={cell - 2} rx="3"
          fill={k === 0 ? "var(--surface)" : "var(--surface-2)"} stroke="var(--ink-3)" strokeWidth="0.6" opacity={faded ? 0.12 : 1} />);
      }
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 330 210" className="w-full max-w-[460px]" role="img" aria-label={`An array of shape ${shape.join(" by ")}`}>
        {cubes}
        <text x="40" y="200" fontSize="12" fill="var(--ai)">time bins →</text>
        <text x="20" y="120" fontSize="12" fill="var(--neuro)" transform="rotate(-90 20 120)">neurons →</text>
        <text x="230" y="40" fontSize="12" fill="var(--accent)">trials ↗</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${reduce === null ? "btn-primary" : ""}`} onClick={() => setReduce(null)}>Whole array</button>
        {AXES.map((a, i) => (
          <button key={a.name} className={`btn !py-1.5 ${reduce === i ? "btn-primary" : ""}`} onClick={() => setReduce(i)}>Average over {a.name} (axis={i})</button>
        ))}
      </div>
      <div className="rounded-lg bg-[var(--code-bg)] px-4 py-3 font-mono text-sm">
        {reduce === null ? (
          <>data.shape  →  ({shape.join(", ")})   # neurons, trials, time bins</>
        ) : (
          <>data.mean(axis={reduce}).shape  →  ({left.map((a) => a.n).join(", ")})   # {left.map((a) => a.name).join(", ")}</>
        )}
      </div>
      {reduce !== null ? (
        <p className="text-sm text-ink-2">
          {reduce === 0 && "Averaging over neurons gives the population activity: one number per trial and time bin."}
          {reduce === 1 && "Averaging over trials gives each neuron's trial-averaged response: the basis of a PSTH."}
          {reduce === 2 && "Averaging over time gives one firing rate per neuron per trial, the input for tuning curves and decoders."}
        </p>
      ) : null}
    </div>
  );
}
