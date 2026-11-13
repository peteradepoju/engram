"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Brain score against task score for a family of simulated models, with the noise ceiling. */
export function BrainScore() {
  const [noise, setNoise] = useState(1);
  const [conf, setConf] = useState(0);
  const qs = Array.from({ length: 9 }, (_, i) => i / 8);
  const r12 = 1 / (1 + noise * noise);
  const ceil = Math.sqrt((2 * r12) / (1 + r12));
  const pts = qs.map((q) => {
    const share = (q * q) / (q * q + (1 - q) * (1 - q) * 9 + 0.01);
    const brain = ceil * Math.sqrt(share) * 0.95;
    const task = Math.min(1, Math.sqrt(share) * (1 - conf) + conf * q);
    return [task, brain];
  });
  const sx = (v: number) => 40 + v * 290, sy = (v: number) => 160 - v * 140;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Brain score against task score">
        <line x1="40" x2="330" y1={sy(ceil)} y2={sy(ceil)} stroke="var(--ink-3)" strokeDasharray="4 3" />
        <text x="44" y={sy(ceil) - 4} fontSize="8" fill="var(--ink-3)">noise ceiling</text>
        <line x1="40" x2="330" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <line x1="40" x2="40" y1={sy(0)} y2={sy(1)} stroke="var(--line)" />
        {pts.map(([t, b], i) => <circle key={i} cx={sx(t)} cy={sy(b)} r="4" fill="var(--neuro)" />)}
        <text x="330" y="176" fontSize="8" textAnchor="end" fill="var(--ink-3)">next-word prediction score</text>
        <text x="44" y="14" fontSize="8" fill="var(--ink-3)">brain score (held-out r)</text>
      </svg>
      <Slider label="measurement noise" value={noise} min={0.2} max={3} step={0.05} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      <Slider label="part of task score driven by a confound (size, data)" value={conf} min={0} max={1} step={0.05} onChange={setConf} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="noise ceiling" value={ceil.toFixed(2)} />
        <Stat label="best model's normalised score" value={(pts[8][1] / ceil).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">A schematic of the simulation in the lesson. Noisier data lower the ceiling and every raw score with it, while normalised scores stay put. A confound that drives task performance can still produce a tidy correlation between task and brain scores.</p>
    </div>
  );
}
