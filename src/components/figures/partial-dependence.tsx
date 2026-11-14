"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Individual conditional expectation curves and their average, the partial dependence, for a model with an interaction. */
export function PartialDependence() {
  const [inter, setInter] = useState(1.5);
  const model = (x1: number, x2: number): number => 0.6 * x1 + inter * x1 * x2;
  const x2s = Array.from({ length: 15 }, (_, i): number => -1 + (2 * i) / 14);
  const grid = Array.from({ length: 41 }, (_, i): number => -1 + i / 20);
  const pd = grid.map((x1) => x2s.reduce((s, x2) => s + model(x1, x2), 0) / x2s.length);
  const sx = (x: number): number => 30 + (x + 1) * 140, sy = (y: number): number => 95 - y * 30;
  const slope = (pd[40] - pd[0]) / 2;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 185" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="ICE curves and partial dependence">
        <line x1="30" x2="310" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {x2s.map((x2, k) => <polyline key={k} points={grid.map((x1) => `${sx(x1)},${sy(model(x1, x2))}`).join(" ")} fill="none" stroke={x2 > 0 ? "var(--neuro)" : "var(--ai)"} strokeWidth="1" opacity="0.5" />)}
        <polyline points={grid.map((x1, i) => `${sx(x1)},${sy(pd[i])}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
        <text x="34" y="14" fontSize="8" fill="var(--ink-3)">thin: one curve per value of x₂ (pink positive, blue negative); thick: their average</text>
        <text x="310" y="180" fontSize="8" textAnchor="end" fill="var(--ink-3)">x₁</text>
      </svg>
      <Slider label="strength of the x₁ × x₂ interaction" value={inter} min={0} max={3} step={0.05} onChange={setInter} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="slope of the partial dependence" value={slope.toFixed(2)} />
        <Stat label="slopes of individual curves" value={`${(0.6 - inter).toFixed(2)} to ${(0.6 + inter).toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">The partial dependence averages the model's prediction over the other feature, and here always shows a gentle positive effect of x₁. The individual curves reveal that the effect of x₁ reverses sign depending on x₂: an interaction that the average hides completely.</p>
    </div>
  );
}
