"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const T = 150;

/** A two-dimensional linear dynamical system: eigenvalues of A set rotation and decay. */
export function LdsRotation() {
  const [angle, setAngle] = useState(12);
  const [decay, setDecay] = useState(0.99);
  const res = useMemo(() => {
    const r = rng(654), th = (angle * Math.PI) / 180;
    const A = [[decay * Math.cos(th), -decay * Math.sin(th)], [decay * Math.sin(th), decay * Math.cos(th)]];
    const z: number[][] = [[2, 0]];
    for (let t = 1; t < T; t++) {
      const p = z[t - 1];
      z.push([A[0][0] * p[0] + A[0][1] * p[1] + 0.05 * gauss(r), A[1][0] * p[0] + A[1][1] * p[1] + 0.05 * gauss(r)]);
    }
    const mod = decay, period = angle > 0.01 ? 360 / angle : Infinity;
    return { z, mod, period };
  }, [angle, decay]);
  const sx = (x: number): number => 170 + x * 35, sy = (y: number): number => 85 - y * 35;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="LDS trajectory">
        <line x1="20" x2="320" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <line x1={sx(0)} x2={sx(0)} y1="6" y2="164" stroke="var(--line)" />
        <polyline points={res.z.map((p) => `${sx(p[0])},${sy(p[1])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.6" />
        {res.z.filter((_, i) => i % 15 === 0).map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="2" fill="var(--neuro)" />)}
      </svg>
      <Slider label="rotation per step (degrees)" value={angle} min={0} max={40} step={1} onChange={setAngle} />
      <Slider label="decay per step" value={decay} min={0.9} max={1.02} step={0.002} onChange={setDecay} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="eigenvalue magnitude" value={res.mod.toFixed(3)} />
        <Stat label="period (steps)" value={res.period === Infinity ? "no rotation" : res.period.toFixed(0)} />
      </div>
      <p className="text-sm text-ink-2">The dynamics matrix A has complex eigenvalues whose angle is the rotation per step and whose magnitude is the decay. Below 1 the trajectory spirals inwards to a fixed point; at 1 it circles; above 1 it spirals out. Rotational trajectories of exactly this kind were reported in motor cortex during reaching.</p>
    </div>
  );
}
