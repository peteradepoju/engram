"use client";

import { useMemo, useState } from "react";
import { useSvgDrag } from "./drag";
import { rng, Slider, Stat } from "./util";

/** A two-dimensional Gaussian: its marginals, and the conditional distribution of x2 given x1, which is again Gaussian and narrower. */
export function GaussianConditional() {
  const [rho, setRho] = useState(0.7);
  const [x1, setX1] = useState(1.2);
  const s1 = 1, s2 = 1.2;
  const pts = useMemo(() => {
    const r = rng(16), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 300 }, () => [g(), g()]);
  }, []);
  const W = 340, C = W / 2, K = 50;
  const P = (u: number, v: number) => [C + u * K, C - v * K];
  const drag = useSvgDrag((_, x) => setX1(Math.max(-3, Math.min(3, (x - C) / K))));
  const cm = rho * (s2 / s1) * x1, cs = s2 * Math.sqrt(1 - rho * rho);
  const samples = pts.map(([u, v]) => [s1 * u, s2 * (rho * u + Math.sqrt(1 - rho * rho) * v)]);
  const dens = (y: number, m: number, sd: number) => Math.exp(-((y - m) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
  const ys = Array.from({ length: 121 }, (_, i) => -3.4 + (i / 120) * 6.8);
  const scale = 60;
  const condCurve = ys.map((y) => `${P(x1, 0)[0] + dens(y, cm, cs) * scale},${P(0, y)[1]}`).join(" ");
  const margCurve = ys.map((y) => `${W - 4 - dens(y, 0, s2) * scale},${P(0, y)[1]}`).join(" ");
  // 2-sd ellipse from the covariance eigen-decomposition
  const a = s1 * s1, b = rho * s1 * s2, d = s2 * s2, tr = a + d, det = a * d - b * b;
  const l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det);
  const ang = Math.atan2(l1 - a, b || 1e-9) * 180 / Math.PI;
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="A two-dimensional Gaussian with a conditional slice">
        <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
        {samples.map(([u, v], i) => <circle key={i} cx={P(u, v)[0]} cy={P(u, v)[1]} r="2" fill="var(--ink-3)" opacity="0.5" />)}
        <ellipse cx={C} cy={C} rx={2 * Math.sqrt(l1) * K} ry={2 * Math.sqrt(Math.max(l2, 1e-6)) * K} transform={`rotate(${-ang} ${C} ${C})`} fill="none" stroke="var(--accent)" strokeWidth="2" />
        <polyline points={margCurve} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1={P(x1, 0)[0]} x2={P(x1, 0)[0]} y1="0" y2={W} stroke="var(--neuro)" strokeWidth="2" strokeDasharray="5 3" />
        <polyline points={condCurve} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <circle cx={P(x1, cm)[0]} cy={P(x1, cm)[1]} r="5" fill="var(--neuro)" />
        <rect x={P(x1, 0)[0] - 14} y={W - 30} width="28" height="26" rx="8" fill="var(--neuro)" opacity="0.9" {...drag.handle("x1")} />
        <text x={P(x1, 0)[0]} y={W - 13} fontSize="11" textAnchor="middle" fill="#fff">⇔</text>
        <text x="6" y={C - 6} fontSize="10" fill="var(--ink-3)">x1</text>
        <text x={C + 6} y="14" fontSize="10" fill="var(--ink-3)">x2</text>
        <text x={W - 8} y="14" fontSize="10" textAnchor="end" fill="var(--ai)">marginal of x2</text>
      </svg>
      <div className="space-y-3">
        <Slider label="correlation ρ" value={rho} min={-0.95} max={0.95} step={0.05} onChange={setRho} fmt={(v) => v.toFixed(2)} />
        <Slider label="observed x1 (or drag the pink handle)" value={x1} min={-3} max={3} step={0.05} onChange={setX1} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="E[x2 | x1]" value={cm.toFixed(2)} />
          <Stat label="sd of x2 given x1" value={`${cs.toFixed(2)} (was ${s2.toFixed(2)})`} />
        </div>
        <p className="text-sm text-ink-2">Two correlated quantities, such as the noisy responses of two neurons, drawn from a Gaussian with the ellipse as its two-standard-deviation contour. The blue curve on the right is the marginal of x2. Knowing x1 slices the cloud along the dashed line: the conditional distribution of x2 (pink) is again Gaussian, centred on a straight-line prediction ρ(σ2/σ1)x1 and narrower by a factor √(1 − ρ²). The stronger the correlation, the more one variable tells you about the other.</p>
      </div>
    </div>
  );
}
