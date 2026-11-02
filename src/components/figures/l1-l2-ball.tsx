"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Least squares under an L1 or L2 budget: the diamond's corners give sparse solutions. */
export function L1L2Ball() {
  const [kind, setKind] = useState<"L1" | "L2">("L1");
  const [t, setT] = useState(1.0);
  const c = [1.8, 0.6];                                     // unconstrained least-squares solution
  const A = [[1.0, 0.35], [0.35, 0.5]];                     // curvature of the loss
  const loss = (w: number[]) => { const d = [w[0] - c[0], w[1] - c[1]]; return A[0][0] * d[0] ** 2 + 2 * A[0][1] * d[0] * d[1] + A[1][1] * d[1] ** 2; };
  const norm = (w: number[]) => (kind === "L1" ? Math.abs(w[0]) + Math.abs(w[1]) : Math.hypot(w[0], w[1]));
  let best = c, bl = Infinity;
  if (norm(c) <= t) { best = c; bl = 0; } else {
    for (let i = 0; i < 2000; i++) {
      const th = (i / 2000) * 2 * Math.PI, d = [Math.cos(th), Math.sin(th)];
      const s = kind === "L1" ? t / (Math.abs(d[0]) + Math.abs(d[1])) : t;
      const w = [s * d[0], s * d[1]], l = loss(w);
      if (l < bl) { bl = l; best = w; }
    }
  }
  const W = 320, C = W / 2 - 40, K = 70;
  const P = (x: number, y: number) => [C + x * K, W / 2 + 30 - y * K];
  const contour = (lev: number) => Array.from({ length: 121 }, (_, i) => { const th = (i / 120) * 2 * Math.PI, d = [Math.cos(th), Math.sin(th)], q = A[0][0] * d[0] ** 2 + 2 * A[0][1] * d[0] * d[1] + A[1][1] * d[1] ** 2, r = Math.sqrt(lev / q); return P(c[0] + r * d[0], c[1] + r * d[1]).join(","); }).join(" ");
  const region = kind === "L1" ? [[t, 0], [0, t], [-t, 0], [0, -t]].map(([x, y]) => P(x, y).join(",")).join(" ") : null;
  const sparse = Math.abs(best[0]) < 0.02 || Math.abs(best[1]) < 0.02;
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Loss contours and an L1 or L2 constraint region">
        <defs><clipPath id="l12c"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#l12c)">
          <line x1="0" x2={W} y1={P(0, 0)[1]} y2={P(0, 0)[1]} stroke="var(--line)" /><line y1="0" y2={W} x1={P(0, 0)[0]} x2={P(0, 0)[0]} stroke="var(--line)" />
          {[0.05, 0.3, 0.8, 1.6, 2.8].map((l) => <polygon key={l} points={contour(l)} fill="none" stroke="var(--accent)" opacity="0.5" />)}
          {region ? <polygon points={region} fill="var(--ai)" opacity="0.2" stroke="var(--ai)" strokeWidth="2" /> : <circle cx={P(0, 0)[0]} cy={P(0, 0)[1]} r={t * K} fill="var(--ai)" opacity="0.2" stroke="var(--ai)" strokeWidth="2" />}
          <circle cx={P(c[0], c[1])[0]} cy={P(c[0], c[1])[1]} r="4" fill="var(--ink-3)" />
          <circle cx={P(best[0], best[1])[0]} cy={P(best[0], best[1])[1]} r="6" fill="var(--neuro)" />
        </g>
        <text x={W - 8} y={P(0, 0)[1] - 6} fontSize="10" textAnchor="end" fill="var(--ink-3)">w₁</text>
        <text x={P(0, 0)[0] + 6} y="14" fontSize="10" fill="var(--ink-3)">w₂</text>
      </svg>
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {(["L1", "L2"] as const).map((k) => <button key={k} className={`btn !py-1.5 ${kind === k ? "btn-primary" : ""}`} onClick={() => setKind(k)}>{k} budget</button>)}
        </div>
        <Slider label="budget t (size of the allowed region)" value={t} min={0.1} max={2.5} step={0.02} onChange={setT} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="constrained solution (w₁, w₂)" value={`(${best[0].toFixed(2)}, ${best[1].toFixed(2)})`} />
          <Stat label="sparse?" value={sparse ? "yes: one weight is zero" : "no"} />
        </div>
        <p className="text-sm text-ink-2">The ellipses are levels of a squared-error loss whose unconstrained minimum is the grey dot. The shaded region is the set of weights allowed by the budget: a diamond for the L1 norm |w₁| + |w₂| ≤ t, a disc for the L2 norm. The best allowed point (pink) is where the smallest ellipse touches the region. The diamond's corners stick out, so the touching point is often a corner, where one weight is exactly zero. The disc has no corners, so L2 shrinks weights without zeroing them.</p>
      </div>
    </div>
  );
}
