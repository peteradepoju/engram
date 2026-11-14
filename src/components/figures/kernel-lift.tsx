"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** Two rings are not linearly separable in the plane, but are after adding the feature x₁² + x₂². */
export function KernelLift() {
  const [thr, setThr] = useState(1.6);
  const pts = useMemo(() => {
    const r = rng(571);
    return Array.from({ length: 120 }, (_, i): [number, number, number] => {
      const c = i % 2, rad = (c ? 1.7 : 0.7) + 0.18 * gauss(r), a = 2 * Math.PI * r();
      return [rad * Math.cos(a), rad * Math.sin(a), c];
    });
  }, []);
  const z = (x: number, y: number): number => x * x + y * y;
  const errs = pts.filter(([x, y, c]) => (z(x, y) > thr * thr ? 1 : 0) !== c).length;
  const lx = (v: number): number => 85 + v * 33, ly = (v: number): number => 95 - v * 33;
  const rx = (x: number): number => 190 + (x + 2.5) * 28, ry = (v: number): number => 170 - v * 26;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 180" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Lifting two rings into a third dimension">
        {pts.map(([x, y, c], i) => <circle key={`a${i}`} cx={lx(x)} cy={ly(y)} r="2.2" fill={c ? "var(--neuro)" : "var(--ai)"} />)}
        <circle cx={lx(0)} cy={ly(0)} r={thr * 33} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="12" y="14" fontSize="8" fill="var(--ink-3)">input space (x₁, x₂)</text>
        <line x1="185" x2="335" y1={ry(thr * thr)} y2={ry(thr * thr)} stroke="var(--ink)" strokeWidth="1.5" />
        {pts.map(([x, y, c], i) => <circle key={`b${i}`} cx={rx(x)} cy={ry(z(x, y))} r="2.2" fill={c ? "var(--neuro)" : "var(--ai)"} />)}
        <text x="190" y="14" fontSize="8" fill="var(--ink-3)">feature space (x₁, x₁² + x₂²)</text>
      </svg>
      <Slider label="threshold on x₁² + x₂² (shown as its square root)" value={thr} min={0.5} max={2.4} step={0.05} onChange={setThr} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="errors (of 120)" value={String(errs)} />
        <Stat label="boundary in input space" value={`circle, radius ${thr.toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">No straight line separates the rings in the plane. Add one feature, the squared distance from the centre, and a flat cut in the new space separates them; mapped back, that cut is a circle. Kernels let linear methods do this with very many features at little cost.</p>
    </div>
  );
}
