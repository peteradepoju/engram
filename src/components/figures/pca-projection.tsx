"use client";

import { useMemo, useState } from "react";
import { useSvgDrag } from "./drag";
import { symEig } from "./linalg";
import { rng, Stat } from "./util";

/** Drag the axis. PCA picks the direction with the most variance, which is also the one with the smallest residuals. */
export function PcaProjection() {
  const pts = useMemo(() => {
    const r = rng(11), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    const raw = Array.from({ length: 60 }, () => { const u = g() * 1.5, v = g() * 0.5; return [0.8 * u - 0.6 * v, 0.6 * u + 0.8 * v]; });
    const m = [raw.reduce((s, p) => s + p[0], 0) / 60, raw.reduce((s, p) => s + p[1], 0) / 60];
    return raw.map((p) => [p[0] - m[0], p[1] - m[1]]);
  }, []);
  const [th, setTh] = useState(1.9);
  const W = 340, C = W / 2, K = 46, R = 3.2;
  const P = (u: number, v: number) => [C + u * K, C - v * K];
  const drag = useSvgDrag((_, X, Y) => setTh(Math.atan2(C - Y, X - C)));
  const u = [Math.cos(th), Math.sin(th)];
  const proj = pts.map((p) => p[0] * u[0] + p[1] * u[1]);
  const varAlong = proj.reduce((s, z) => s + z * z, 0) / pts.length;
  const total = pts.reduce((s, p) => s + p[0] ** 2 + p[1] ** 2, 0) / pts.length;
  const S = [[0, 0], [0, 0]];
  pts.forEach((p) => { S[0][0] += p[0] * p[0] / 60; S[0][1] += p[0] * p[1] / 60; S[1][1] += p[1] * p[1] / 60; });
  S[1][0] = S[0][1];
  const e = symEig(S), best = Math.atan2(e.vectors[0][1], e.vectors[0][0]);
  const [hx, hy] = P(R * u[0], R * u[1]);
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Data projected onto a chosen axis">
        <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
        <line x1={P(-R * u[0], -R * u[1])[0]} y1={P(-R * u[0], -R * u[1])[1]} x2={hx} y2={hy} stroke="var(--accent)" strokeWidth="2.5" />
        {pts.map((p, i) => { const f = [proj[i] * u[0], proj[i] * u[1]]; const [x1, y1] = P(p[0], p[1]), [x2, y2] = P(f[0], f[1]);
          return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--bad)" opacity="0.5" /><circle cx={x2} cy={y2} r="2.2" fill="var(--accent)" /><circle cx={x1} cy={y1} r="3" fill="var(--neuro)" /></g>; })}
        <circle cx={hx} cy={hy} r="9" fill="var(--accent)" opacity="0.5" {...drag.handle("axis")} />
      </svg>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="variance along the axis" value={varAlong.toFixed(3)} />
          <Stat label="mean squared residual" value={(total - varAlong).toFixed(3)} />
          <Stat label="their sum (fixed)" value={total.toFixed(3)} />
          <Stat label="largest possible (λ₁)" value={e.values[0].toFixed(3)} />
        </div>
        <button className="btn !py-1.5" onClick={() => setTh(best)}>Snap to the first principal component</button>
        <p className="text-sm text-ink-2">Drag the purple handle to turn the axis. Each pink point drops a red line onto it. By Pythagoras, variance along the axis plus mean squared residual is the same for every axis, so making one as large as possible makes the other as small as possible. The best axis is the top eigenvector of the covariance matrix, and the variance along it is the top eigenvalue.</p>
      </div>
    </div>
  );
}
