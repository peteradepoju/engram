"use client";

import { useState } from "react";
import { Arrow, useSvgDrag } from "./drag";
import { symEig } from "./linalg";
import { Slider, Stat } from "./util";

/** Maximise a quadratic form on the unit circle: at the best point, the objective's gradient is parallel to the constraint's. */
export function LagrangeContours() {
  const [ang, setAng] = useState(0.4);
  const [rho, setRho] = useState(0.6);
  const S = [[1.6, rho], [rho, 0.7]];
  const f = (x: number, y: number) => S[0][0] * x * x + 2 * S[0][1] * x * y + S[1][1] * y * y;
  const W = 320, C = W / 2, K = 100;
  const P = (x: number, y: number) => [C + x * K, C - y * K];
  const drag = useSvgDrag((_, X, Y) => setAng(Math.atan2(C - Y, X - C)));
  const u = [Math.cos(ang), Math.sin(ang)];
  const gf = [2 * (S[0][0] * u[0] + S[0][1] * u[1]), 2 * (S[1][0] * u[0] + S[1][1] * u[1])];
  const gg = [2 * u[0], 2 * u[1]];
  const cross = gf[0] * gg[1] - gf[1] * gg[0], cosang = (gf[0] * gg[0] + gf[1] * gg[1]) / (Math.hypot(...gf) * Math.hypot(...gg));
  const e = symEig(S);
  const levels = [0.3, 0.6, 1.0, 1.5, 2.2, 3.0];
  const contour = (c: number) => Array.from({ length: 121 }, (_, i) => { const t = (i / 120) * 2 * Math.PI, d = [Math.cos(t), Math.sin(t)], q = f(d[0], d[1]), r = Math.sqrt(c / q); return P(r * d[0], r * d[1]).join(","); }).join(" ");
  const [px, py] = P(u[0], u[1]);
  const sc = 0.13;
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="Contours of an objective and a circular constraint">
        <defs><clipPath id="lcc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#lcc)">
          {levels.map((c) => <polygon key={c} points={contour(c)} fill="none" stroke="var(--accent)" opacity="0.45" />)}
          <circle cx={C} cy={C} r={K} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="5 4" />
          <Arrow id="lgf" x1={px} y1={py} x2={px + gf[0] * sc * K} y2={py - gf[1] * sc * K} color="var(--neuro)" width={2.5} />
          <Arrow id="lgg" x1={px} y1={py} x2={px + gg[0] * sc * K} y2={py - gg[1] * sc * K} color="var(--ai)" width={2.5} />
          <circle cx={px} cy={py} r="9" fill="var(--ink)" opacity="0.5" {...drag.handle("u")} />
        </g>
      </svg>
      <div className="space-y-3">
        <Slider label="covariance between the two neurons" value={rho} min={-0.9} max={0.9} step={0.05} onChange={setRho} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="objective uᵀΣu at the point" value={f(u[0], u[1]).toFixed(3)} />
          <Stat label="largest possible (top eigenvalue)" value={e.values[0].toFixed(3)} />
          <Stat label="angle between the gradients" value={`${((Math.acos(Math.max(-1, Math.min(1, cosang))) * 180) / Math.PI).toFixed(1)}°`} />
          <Stat label="λ = |∇f| / |∇g| at the point" value={Math.abs(cross) < 0.02 ? (Math.hypot(...gf) / Math.hypot(...gg)).toFixed(3) : "not parallel"} />
        </div>
        <p className="text-sm text-ink-2">The purple ellipses are levels of the variance uᵀΣu along a direction u; the dashed circle is the constraint that u has length 1. Drag the grey point round the circle. The pink arrow is ∇f, the blue arrow ∇g for the constraint g = uᵀu. Where the variance is largest the two arrows line up: ∇f = λ∇g. That condition is Σu = λu, so the best direction is an eigenvector and λ its eigenvalue: PCA from Lagrange multipliers.</p>
      </div>
    </div>
  );
}
