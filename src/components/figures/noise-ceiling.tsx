"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const S = 40;
const truth = Array.from({ length: S }, (_, s): number => 4 + 3 * Math.exp(-(((s - 20) / 6) ** 2)) + 1.5 * Math.sin(s / 3));

/** Even a perfect model of a neuron's tuning cannot explain trial-to-trial noise: the noise ceiling. */
export function NoiseCeiling() {
  const [reps, setReps] = useState(4);
  const [noise, setNoise] = useState(2);
  const st = useMemo(() => {
    const r = rng(592);
    const trials = truth.map((t) => Array.from({ length: reps }, () => t + noise * gauss(r)));
    const mean = trials.map((x) => x.reduce((a, b) => a + b, 0) / reps);
    const r2 = (y: number[], p: number[]): number => {
      const m = y.reduce((a, b) => a + b, 0) / y.length;
      return 1 - y.reduce((s, v, i) => s + (v - p[i]) ** 2, 0) / y.reduce((s, v) => s + (v - m) ** 2, 0);
    };
    const varTrue = truth.reduce((s, v) => s + (v - truth.reduce((a, b) => a + b, 0) / S) ** 2, 0) / S;
    const ceiling = varTrue / (varTrue + (noise * noise) / reps);
    return { mean, perfect: r2(mean, truth), ceiling };
  }, [reps, noise]);
  const sx = (s: number): number => 25 + s * 7.4, sy = (v: number): number => 150 - (v - 0) * 12;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Tuning curve with noisy averages">
        <polyline points={truth.map((t, s) => `${sx(s)},${sy(t)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        {st.mean.map((m, s) => <circle key={s} cx={sx(s)} cy={Math.max(5, Math.min(165, sy(m)))} r="2.5" fill="var(--ai)" />)}
        <text x="30" y="14" fontSize="8" fill="var(--neuro)">true tuning (a perfect model)</text>
        <text x="170" y="14" fontSize="8" fill="var(--ai)">measured mean response per stimulus</text>
        <text x="320" y="166" fontSize="8" textAnchor="end" fill="var(--ink-3)">stimulus</text>
      </svg>
      <Slider label="repeats per stimulus" value={reps} min={1} max={30} step={1} onChange={setReps} />
      <Slider label="trial-to-trial noise (sd)" value={noise} min={0.2} max={4} step={0.1} onChange={setNoise} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="R² of the perfect model" value={st.perfect.toFixed(2)} />
        <Stat label="expected ceiling" value={st.ceiling.toFixed(2)} />
        <Stat label="normalised" value={(st.perfect / st.ceiling).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The true tuning curve is the best any model can do, yet it explains only part of the variance of the measured means, because averaging a few noisy trials leaves noise behind. The noise ceiling is the variance a perfect model could explain; dividing by it gives a score that compares fairly across neurons and datasets.</p>
    </div>
  );
}
