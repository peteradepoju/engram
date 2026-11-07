"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Two Lorenz trajectories that start a tiny distance apart: they stay together, then separate completely. */
export function LorenzButterfly() {
  const [rho, setRho] = useState(28);
  const [logd, setLogd] = useState(-6);
  const sigma = 10, beta = 8 / 3, dt = 0.005, steps = 6000;
  const { A, B, sep } = useMemo(() => {
    const f = (p: number[]) => [sigma * (p[1] - p[0]), p[0] * (rho - p[2]) - p[1], p[0] * p[1] - beta * p[2]];
    const step = (p: number[]) => {
      const k1 = f(p), k2 = f(p.map((v, i) => v + (dt / 2) * k1[i])), k3 = f(p.map((v, i) => v + (dt / 2) * k2[i])), k4 = f(p.map((v, i) => v + dt * k3[i]));
      return p.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    };
    let a = [1, 1, 20], b = [1 + 10 ** logd, 1, 20];
    const A: number[][] = [], B: number[][] = [], sep: number[] = [];
    for (let k = 0; k < steps; k++) { a = step(a); b = step(b); if (k % 4 === 0) { A.push(a); B.push(b); sep.push(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])); } }
    return { A, B, sep };
  }, [rho, logd]);
  const W = 360, H = 240, X = (x: number) => W / 2 + x * 6.5, Z = (z: number) => 162 - z * 2.6;
  const tSplit = sep.findIndex((s) => s > 1) * 4 * dt;
  const sx = (i: number) => 10 + (i / sep.length) * (W - 20), sy = (s: number) => H - 8 - ((Math.log10(Math.max(s, 1e-9)) + 9) / 11) * 50;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Two Lorenz trajectories in the x-z plane and their separation">
        <polyline points={A.map((p) => `${X(p[0])},${Z(p[2])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="0.9" opacity="0.85" />
        <polyline points={B.map((p) => `${X(p[0])},${Z(p[2])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="0.9" opacity="0.7" />
        <line x1="10" x2={W - 10} y1={H - 8} y2={H - 8} stroke="var(--line)" />
        <polyline points={sep.map((s, i) => `${sx(i)},${sy(s)}`).join(" ")} fill="none" stroke="var(--warn)" strokeWidth="1.5" />
        <text x="14" y="16" fontSize="9" fill="var(--neuro)">trajectory 1</text>
        <text x="14" y="28" fontSize="9" fill="var(--ai)">trajectory 2</text>
        <text x="14" y={H - 64} fontSize="9" fill="var(--warn)">separation (log scale) over 30 time units</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="ρ" value={rho} min={10} max={35} step={0.5} onChange={setRho} />
        <Slider label="initial separation (log10)" value={logd} min={-9} max={-1} step={1} onChange={setLogd} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="time until separation exceeds 1" value={tSplit > 0 ? tSplit.toFixed(1) : "never (in 30)"} />
        <Stat label="final separation" value={sep[sep.length - 1].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Lorenz's three equations for convection, drawn in the x-z plane. Two trajectories start almost together. Their separation (bottom) grows exponentially, a straight line on the log scale, until it is as large as the attractor itself. Making the starting difference a thousand times smaller only delays the split by a fixed time: prediction is limited by the logarithm of your precision. Lower ρ below about 24.7 and the trajectories settle onto fixed points instead.</p>
    </div>
  );
}
