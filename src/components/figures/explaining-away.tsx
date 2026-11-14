"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Explaining away: a neuron driven by a stimulus or by arousal. Observing arousal changes what the response says about the stimulus. */
export function ExplainingAway() {
  const [obsR, setObsR] = useState(1);
  const [obsA, setObsA] = useState(2);
  const pS = 0.2, pA = 0.3;
  const pR = (s: number, a: number): number => [[0.05, 0.7], [0.8, 0.95]][s][a];
  const joint = (s: number, a: number, r: number): number => (s ? pS : 1 - pS) * (a ? pA : 1 - pA) * (r ? pR(s, a) : 1 - pR(s, a));
  const post = (): number => {
    let num = 0, den = 0;
    for (const s of [0, 1]) for (const a of [0, 1]) {
      if (obsA !== 2 && a !== obsA) continue;
      const p = joint(s, a, obsR); den += p; if (s) num += p;
    }
    return num / den;
  };
  const p = post();
  const label = ["not observed", "observed: low", "observed: high"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="A collider network">
        {[["stimulus", 70, 35, "var(--neuro)"], ["arousal", 270, 35, "var(--ai)"], ["response", 170, 115, "var(--ink-3)"]].map(([t, x, y, c]) => (
          <g key={t as string}>
            <ellipse cx={x as number} cy={y as number} rx="48" ry="18" fill="none" stroke={c as string} strokeWidth="2" />
            <text x={x as number} y={(y as number) + 4} fontSize="11" textAnchor="middle" fill="var(--ink)">{t as string}</text>
          </g>
        ))}
        <line x1="95" y1="50" x2="140" y2="100" stroke="var(--ink-3)" strokeWidth="1.5" markerEnd="url(#arr)" />
        <line x1="245" y1="50" x2="200" y2="100" stroke="var(--ink-3)" strokeWidth="1.5" markerEnd="url(#arr)" />
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-3)" /></marker></defs>
      </svg>
      <Slider label="neuron's response" value={obsR} min={0} max={1} step={1} onChange={setObsR} fmt={(v) => (v ? "fired" : "silent")} />
      <Slider label="arousal (pupil)" value={obsA} min={0} max={2} step={1} onChange={setObsA} fmt={(v) => label[v === 2 ? 0 : v + 1]} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="prior probability of the stimulus" value={pS.toFixed(2)} />
        <Stat label="posterior given what is observed" value={p.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The neuron fires for the stimulus or when the animal is aroused. If it fires, the stimulus becomes more likely. Now learn that arousal was high: the firing is explained by arousal, and the stimulus becomes less likely again. Stimulus and arousal are independent, but once their common effect is observed, they compete to explain it.</p>
    </div>
  );
}
