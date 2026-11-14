"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

function phi(z: number): number { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp((-z * z) / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }

/** Two score distributions, a threshold, and the ROC curve it traces. */
export function RocCurve() {
  const [dp, setDp] = useState(1.5);
  const [thr, setThr] = useState(0.75);
  const tpr = (c: number): number => 1 - phi(c - dp), fpr = (c: number): number => 1 - phi(c);
  const grid = Array.from({ length: 121 }, (_, i): number => -4 + i * (4 + dp + 4) / 120);
  const sxD = (v: number): number => 20 + ((v + 3) / (dp + 6)) * 150, syD = (p: number): number => 150 - p * 300;
  const pdf = (v: number, m: number): number => Math.exp(-((v - m) ** 2) / 2) / Math.sqrt(2 * Math.PI);
  const rx = (f: number): number => 200 + f * 120, ry = (t: number): number => 150 - t * 120;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 175" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Score distributions and ROC curve">
        <polyline points={grid.map((v) => `${sxD(v)},${syD(pdf(v, 0))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.8" />
        <polyline points={grid.map((v) => `${sxD(v)},${syD(pdf(v, dp))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        <line x1={sxD(thr)} x2={sxD(thr)} y1="20" y2="150" stroke="var(--ink)" strokeDasharray="3 3" />
        <text x="20" y="168" fontSize="8" fill="var(--ink-3)">score: blue negatives, pink positives</text>
        <rect x="200" y="30" width="120" height="120" fill="none" stroke="var(--line)" />
        <line x1="200" x2="320" y1="150" y2="30" stroke="var(--line)" strokeDasharray="2 2" />
        <polyline points={grid.map((c) => `${rx(fpr(c))},${ry(tpr(c))}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.8" />
        <circle cx={rx(fpr(thr))} cy={ry(tpr(thr))} r="4" fill="var(--neuro)" />
        <text x="260" y="168" fontSize="8" textAnchor="middle" fill="var(--ink-3)">false positive rate</text>
        <text x="196" y="26" fontSize="8" fill="var(--ink-3)">true positive rate</text>
      </svg>
      <Slider label="separation d′" value={dp} min={0} max={4} step={0.05} onChange={setDp} fmt={(v) => v.toFixed(2)} />
      <Slider label="threshold" value={thr} min={-2.5} max={6} step={0.05} onChange={setThr} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="true positive rate" value={tpr(thr).toFixed(2)} />
        <Stat label="false positive rate" value={fpr(thr).toFixed(2)} />
        <Stat label="AUC = Φ(d′/√2)" value={phi(dp / Math.SQRT2).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Every threshold gives one point on the ROC curve; sliding it traces the whole curve. The area under the curve does not depend on the threshold: it is the probability that a random positive scores higher than a random negative.</p>
    </div>
  );
}
