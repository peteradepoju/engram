"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** Least-squares estimates of two weights from many simulated datasets, as the two regressors become correlated. */
export function WeightUncertainty() {
  const [rho, setRho] = useState(0.5);
  const n = 50, sigma = 1, w = [1, 0.5];
  const est = useMemo(() => {
    const r = rng(551);
    return Array.from({ length: 300 }, (): [number, number] => {
      let s11 = 0, s12 = 0, s22 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < n; i++) {
        const z1 = gauss(r), z2 = gauss(r);
        const x1 = z1, x2 = rho * z1 + Math.sqrt(1 - rho * rho) * z2;
        const y = w[0] * x1 + w[1] * x2 + sigma * gauss(r);
        s11 += x1 * x1; s12 += x1 * x2; s22 += x2 * x2; b1 += x1 * y; b2 += x2 * y;
      }
      const det = s11 * s22 - s12 * s12;
      return [(s22 * b1 - s12 * b2) / det, (s11 * b2 - s12 * b1) / det];
    });
  }, [rho]);
  const sd = (k: 0 | 1): number => { const m = est.reduce((a, e) => a + e[k], 0) / est.length; return Math.sqrt(est.reduce((a, e) => a + (e[k] - m) ** 2, 0) / est.length); };
  const theory = Math.sqrt(sigma * sigma / (n * (1 - rho * rho)));
  const sx = (v: number): number => 170 + (v - w[0]) * 110, sy = (v: number): number => 90 - (v - w[1]) * 110;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Scatter of estimated weights">
        <line x1="20" x2="320" y1={sy(w[1])} y2={sy(w[1])} stroke="var(--line)" />
        <line x1={sx(w[0])} x2={sx(w[0])} y1="10" y2="170" stroke="var(--line)" />
        {est.map(([a, b], i) => <circle key={i} cx={sx(a)} cy={sy(b)} r="1.8" fill="var(--ai)" opacity="0.6" />)}
        <circle cx={sx(w[0])} cy={sy(w[1])} r="4" fill="var(--neuro)" />
        <text x="24" y="16" fontSize="8" fill="var(--ink-3)">each dot: (ŵ₁, ŵ₂) from one dataset of 50 trials</text>
        <text x="318" y={sy(w[1]) - 4} fontSize="8" textAnchor="end" fill="var(--ink-3)">ŵ₁</text>
      </svg>
      <Slider label="correlation between the regressors ρ" value={rho} min={0} max={0.98} step={0.01} onChange={setRho} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="SD of ŵ₁ (simulated)" value={sd(0).toFixed(3)} />
        <Stat label="SD of ŵ₁ (formula)" value={theory.toFixed(3)} />
        <Stat label="variance inflation" value={(1 / (1 - rho * rho)).toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">As the regressors become correlated, the cloud of estimates stretches along a diagonal: the data pin down the sum of their effects but not how it is shared, so each weight becomes uncertain and the two estimates become negatively correlated.</p>
    </div>
  );
}
