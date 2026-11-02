"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { eig2 } from "./linalg";
import { Slider, Stat } from "./util";

const PRESETS: Record<string, [number, number, number, number]> = {
  "one grows": [1.2, 0.3, 0.3, 0.6], "both decay": [0.8, 0.2, 0.1, 0.5], "saddle": [1.15, 0, 0.4, 0.7], "spiral in": [0.8, -0.45, 0.45, 0.8], "line attractor": [1, 0, 0, 0.6],
};

/** Repeatedly apply A to a starting vector: x, Ax, A²x, ... The largest eigenvalue takes over. */
export function MatrixPowers() {
  const [m, setM] = useState<[number, number, number, number]>([1.2, 0.3, 0.3, 0.6]);
  const [x0, setX0] = useState<[number, number]>([2.5, -3.5]);
  const [steps, setSteps] = useState(5);
  const [a, b, c, d] = m;
  const W = 340, C = W / 2, S = 34;
  const drag = useSvgDrag((_, X, Y) => setX0([Math.max(-4.5, Math.min(4.5, (X - C) / S)), Math.max(-4.5, Math.min(4.5, (C - Y) / S))]));
  const traj: number[][] = [x0];
  for (let k = 0; k < steps; k++) { const [u, v] = traj[traj.length - 1]; traj.push([a * u + b * v, c * u + d * v]); }
  const e = eig2(a, b, c, d);
  const P = (u: number, v: number) => [C + u * S, C - v * S];
  const last = traj[traj.length - 1], prev = traj[traj.length - 2];
  const ratio = Math.hypot(last[0], last[1]) / (Math.hypot(prev[0], prev[1]) || 1);
  const fmt = (v: number) => v.toFixed(2);
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Repeated application of a matrix">
        <defs><clipPath id="mpc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#mpc)">
          {Array.from({ length: 11 }, (_, i) => i - 5).map((i) => <g key={i}><line x1={C + i * S} x2={C + i * S} y1="0" y2={W} stroke="var(--line)" /><line y1={C + i * S} y2={C + i * S} x1="0" x2={W} stroke="var(--line)" /></g>)}
          {e.real ? [e.v1!, e.v2!].map((v, i) => <line key={i} x1={P(-8 * v[0], -8 * v[1])[0]} y1={P(-8 * v[0], -8 * v[1])[1]} x2={P(8 * v[0], 8 * v[1])[0]} y2={P(8 * v[0], 8 * v[1])[1]} stroke="var(--warn)" strokeDasharray="5 4" opacity={i === 0 ? 0.9 : 0.45} />) : null}
          <polyline points={traj.map(([u, v]) => P(u, v).join(",")).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" opacity="0.7" />
          {traj.map(([u, v], i) => <circle key={i} cx={P(u, v)[0]} cy={P(u, v)[1]} r={i === 0 ? 8 : 4} fill={i === 0 ? "var(--neuro)" : "var(--ai)"} opacity={i === 0 ? 1 : 0.4 + 0.6 * (i / steps)} {...(i === 0 ? drag.handle("x0") : {})} />)}
        </g>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PRESETS).map(([name, v]) => <button key={name} className="chip !py-1" onClick={() => setM(v)}>{name}</button>)}
        </div>
        <Slider label="number of steps" value={steps} min={1} max={25} step={1} onChange={setSteps} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="eigenvalues" value={e.real ? `${fmt(e.l1)}, ${fmt(e.l2)}` : `${fmt(e.l1)} ± ${fmt(e.im)}i`} />
          <Stat label={e.real ? "largest |λ|" : "|λ| (both)"} value={e.real ? fmt(Math.max(Math.abs(e.l1), Math.abs(e.l2))) : fmt(Math.hypot(e.l1, e.im))} />
          <Stat label="growth in the last step" value={`× ${fmt(ratio)}`} />
          <Stat label="matrix" value={`[${fmt(a)} ${fmt(b)}; ${fmt(c)} ${fmt(d)}]`} />
        </div>
        <p className="text-sm text-ink-2">Drag the pink start point. Each blue dot is one more multiplication by A. Whatever the start, the points swing towards the dashed line of the largest eigenvalue, and the growth per step approaches that eigenvalue: this is the power method. If every |λ| is below 1 the points fall to the origin; with complex eigenvalues they spiral.</p>
      </div>
    </div>
  );
}
