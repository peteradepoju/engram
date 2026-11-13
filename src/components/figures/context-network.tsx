"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Psychometric functions for a context-dependent decision: relevant and irrelevant features. */
export function ContextNetwork() {
  const [leak, setLeak] = useState(0.05);
  const [noise, setNoise] = useState(0.3);
  const phi = (z: number) => 0.5 * (1 + Math.tanh(0.7978845608 * (z + 0.044715 * z * z * z)));
  const cohs = useMemo(() => Array.from({ length: 41 }, (_, i) => -0.5 + i * 0.025), []);
  const rel = cohs.map((c) => phi(c / noise));
  const irr = cohs.map((c) => phi((leak * c) / noise));
  const W = 360, H = 170, sx = (c: number) => 40 + ((c + 0.5) / 1) * 290, sy = (p: number) => H - 22 - p * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Context-dependent psychometric functions">
        <line x1="40" x2="330" y1={sy(0.5)} y2={sy(0.5)} stroke="var(--line)" strokeDasharray="3 3" />
        <line x1={sx(0)} x2={sx(0)} y1={sy(0)} y2={sy(1)} stroke="var(--line)" />
        <polyline points={cohs.map((c, i) => `${sx(c)},${sy(rel[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={cohs.map((c, i) => `${sx(c)},${sy(irr[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="44" y="16" fontSize="9" fill="var(--neuro)">choices by motion, motion context</text>
        <text x="44" y="28" fontSize="9" fill="var(--ai)">choices by motion, colour context</text>
        <text x="330" y={H - 6} fontSize="8" textAnchor="end" fill="var(--ink-3)">motion coherence (left ← → right)</text>
      </svg>
      <Slider label="leak of the irrelevant feature into the choice" value={leak} min={0} max={1} step={0.01} onChange={setLeak} fmt={(v) => v.toFixed(2)} />
      <Slider label="noise" value={noise} min={0.05} max={0.6} step={0.01} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="P(right), strong right motion, motion context" value={rel[40].toFixed(2)} />
        <Stat label="same stimulus, colour context" value={irr[40].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Monkeys and well-trained networks show a steep curve for the relevant feature and a nearly flat one for the irrelevant feature, even though the irrelevant feature is still represented inside the network. Increase the leak to see what imperfect selection would look like.</p>
    </div>
  );
}
