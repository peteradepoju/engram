"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { Stat } from "./util";

/** The trace-determinant plane for 2 × 2 linear systems, with the phase portrait of the chosen point. */
export function TraceDeterminant() {
  const [T, setT] = useState(-1);
  const [D, setD] = useState(2);
  const W = 360, H = 200, pw = 200;
  const X = (t: number) => 10 + ((t + 4) / 8) * (pw - 20), Y = (d: number) => 10 + ((5 - d) / 8) * (H - 30);
  const drag = useSvgDrag((_, x, y) => {
    if (x > pw) return;
    setT(Math.max(-4, Math.min(4, ((x - 10) / (pw - 20)) * 8 - 4)));
    setD(Math.max(-3, Math.min(5, 5 - ((y - 10) / (H - 30)) * 8)));
  });
  const c = (T * T) / 4 - D;                       // A = [[T/2, 1], [c, T/2]], eigenvalues T/2 ± √c
  const A = [[T / 2, 1], [c, T / 2]];
  const disc = c;
  let kind: string;
  if (D < 0) kind = "saddle";
  else if (disc >= 0) kind = T < 0 ? "stable node" : T > 0 ? "unstable node" : "degenerate";
  else kind = Math.abs(T) < 0.05 ? "centre" : T < 0 ? "stable spiral" : "unstable spiral";
  const eig = disc >= 0 ? `${(T / 2 + Math.sqrt(disc)).toFixed(2)}, ${(T / 2 - Math.sqrt(disc)).toFixed(2)}` : `${(T / 2).toFixed(2)} ± ${Math.sqrt(-disc).toFixed(2)}i`;
  const para = Array.from({ length: 81 }, (_, i) => { const t = -4 + i * 0.1; return `${X(t)},${Y(Math.min(5, (t * t) / 4))}`; }).join(" ");
  const cx = pw + (W - pw) / 2, cy = H / 2 - 5, s = 34;
  const trajs = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
    const a = (k / 8) * 2 * Math.PI;
    let x = Math.cos(a) * 1.6, y = Math.sin(a) * 1.6;
    const pts: string[] = [];
    for (let i = 0; i < 300; i++) {
      pts.push(`${cx + x * s},${cy - y * s}`);
      const dx = A[0][0] * x + A[0][1] * y, dy = A[1][0] * x + A[1][1] * y;
      x += 0.01 * dx; y += 0.01 * dy;
      if (Math.abs(x) > 2.2 || Math.abs(y) > 2.2) break;
    }
    return <polyline key={k} points={pts.join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />;
  });
  return (
    <div className="space-y-3">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Trace-determinant plane and the corresponding phase portrait">
        <rect x={X(-4)} y={Y(0)} width={pw - 20} height={Y(-3) - Y(0)} fill="var(--warn)" opacity="0.12" />
        <line x1={X(-4)} x2={X(4)} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <line x1={X(0)} x2={X(0)} y1={Y(5)} y2={Y(-3)} stroke="var(--line)" />
        <polyline points={para} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={X(-3.9)} y={Y(-2.4)} fontSize="9" fill="var(--warn)">saddles</text>
        <text x={X(-3.9)} y={Y(4.4)} fontSize="9" fill="var(--ink-3)">stable</text>
        <text x={X(3.9)} y={Y(4.4)} fontSize="9" textAnchor="end" fill="var(--ink-3)">unstable</text>
        <text x={X(0) + 3} y={Y(4.6)} fontSize="9" fill="var(--ink-3)">spirals</text>
        <text x={X(-3.9)} y={Y(1.2)} fontSize="9" fill="var(--ink-3)">nodes</text>
        <text x={X(4)} y={Y(0) + 12} fontSize="9" textAnchor="end" fill="var(--ink-3)">trace</text>
        <text x={X(0) + 3} y={Y(-2.8)} fontSize="9" fill="var(--ink-3)">det</text>
        <circle cx={X(T)} cy={Y(D)} r="7" fill="var(--neuro)" {...drag.handle("p")} />
        <rect x={pw + 6} y="8" width={W - pw - 12} height={H - 26} rx="6" fill="none" stroke="var(--line)" />
        <g style={{ pointerEvents: "none" }}>{trajs}</g>
        <circle cx={cx} cy={cy} r="3" fill="var(--ink)" />
        <text x={cx} y={H - 4} fontSize="10" textAnchor="middle" fill="var(--ink-2)">{kind}</text>
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="trace, determinant (drag the dot)" value={`${T.toFixed(2)}, ${D.toFixed(2)}`} />
        <Stat label="eigenvalues" value={eig} />
      </div>
      <p className="text-sm text-ink-2">Every 2 × 2 linear system ẋ = Ax is classified by two numbers: the trace (the sum of the eigenvalues) and the determinant (their product). Below the axis the eigenvalues have opposite signs: a saddle. Above it, the left half is stable and the right half unstable, and the dashed parabola, trace² = 4 det, separates real eigenvalues (nodes) from complex ones (spirals). The panel on the right shows trajectories from eight starting points.</p>
    </div>
  );
}
