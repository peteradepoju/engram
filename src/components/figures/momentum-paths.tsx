"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Gradient descent with and without momentum on a long, narrow quadratic valley. */
export function MomentumPaths() {
  const [kappa, setKappa] = useState(25);
  const [beta, setBeta] = useState(0.67);
  const L = kappa, mu = 1, lr = 1 / L;
  const run = (b: number) => {
    let x = -2.6, y = 1.0, vx = 0, vy = 0; const pts = [[x, y]];
    for (let k = 0; k < 60; k++) {
      vx = b * vx - lr * mu * x; vy = b * vy - lr * L * y; x += vx; y += vy;
      if (Math.abs(x) > 20 || Math.abs(y) > 20) break; pts.push([x, y]);
    }
    return pts;
  };
  const gd = run(0), mom = run(beta);
  const f = (p: number[]) => 0.5 * (mu * p[0] ** 2 + L * p[1] ** 2);
  const W = 540, H = 200, X = (x: number) => W / 2 + x * 90, Y = (y: number) => H / 2 - y * 80;
  const ellipses = [0.1, 0.4, 1, 2, 3.5].map((c) => <ellipse key={c} cx={X(0)} cy={Y(0)} rx={Math.sqrt(2 * c / mu) * 90} ry={Math.sqrt(2 * c / L) * 80} fill="none" stroke="var(--line)" />);
  const path = (pts: number[][], colour: string) => <g><polyline points={pts.map((p) => `${X(p[0])},${Y(p[1])}`).join(" ")} fill="none" stroke={colour} strokeWidth="1.8" />{pts.map((p, i) => <circle key={i} cx={X(p[0])} cy={Y(p[1])} r="2.3" fill={colour} />)}</g>;
  const bestBeta = ((Math.sqrt(kappa) - 1) / (Math.sqrt(kappa) + 1)) ** 2;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Gradient descent and momentum paths on an elongated quadratic">
        <defs><clipPath id="mpc2"><rect width={W} height={H} /></clipPath></defs>
        <g clipPath="url(#mpc2)">{ellipses}{path(gd, "var(--ai)")}{path(mom, "var(--neuro)")}</g>
        <text x="10" y="16" fontSize="10" fill="var(--ai)">gradient descent (η = 1/L)</text>
        <text x="10" y="30" fontSize="10" fill="var(--neuro)">with momentum β = {beta.toFixed(2)}</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="condition number κ" value={kappa} min={2} max={100} step={1} onChange={setKappa} />
        <Slider label="momentum β" value={beta} min={0} max={0.98} step={0.01} onChange={setBeta} fmt={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="loss after 60 steps, GD" value={f(gd[gd.length - 1]).toExponential(2)} />
        <Stat label="with momentum" value={mom.length < 61 ? "diverged" : f(mom[mom.length - 1]).toExponential(2)} />
        <Stat label="best β for this κ, about" value={bestBeta.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Both runs use the same step, 1/L, set by the steep direction. Plain gradient descent (blue) crawls along the shallow floor of the valley. Momentum (pink) accumulates speed along the floor while its zigzags across the valley cancel out. Too little momentum and it behaves like plain descent; too much and it overshoots and spirals. The best value approaches 1 as the valley gets narrower.</p>
    </div>
  );
}
