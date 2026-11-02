"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { Slider, Stat } from "./util";

/** A nonlinear map warps the plane; near any point it looks like the linear map given by its Jacobian. */
export function JacobianWarp() {
  const [k, setK] = useState(0.6);
  const [p, setP] = useState<[number, number]>([0.6, -0.4]);
  const F = (x: number, y: number): [number, number] => [x + k * Math.sin(1.5 * y), y + k * Math.tanh(1.5 * x)];
  const J = (x: number, y: number) => [[1, 1.5 * k * Math.cos(1.5 * y)], [1.5 * k * (1 - Math.tanh(1.5 * x) ** 2), 1]];
  const W = 340, C = W / 2, S = 55;
  const P = (x: number, y: number) => [C + x * S, C - y * S];
  const drag = useSvgDrag((_, X, Y) => setP([Math.max(-2, Math.min(2, (X - C) / S)), Math.max(-2, Math.min(2, (C - Y) / S))]));
  const lines = [];
  for (let i = -6; i <= 6; i++) {
    const v = i * 0.5;
    const a = Array.from({ length: 61 }, (_, j) => { const t = -3 + j * 0.1; return P(...F(v, t)).join(","); }).join(" ");
    const b = Array.from({ length: 61 }, (_, j) => { const t = -3 + j * 0.1; return P(...F(t, v)).join(","); }).join(" ");
    lines.push(<polyline key={`a${i}`} points={a} fill="none" stroke="var(--accent)" opacity="0.3" />, <polyline key={`b${i}`} points={b} fill="none" stroke="var(--accent)" opacity="0.3" />);
  }
  const h = 0.35, Jp = J(p[0], p[1]), Fp = F(p[0], p[1]);
  const sqTrue = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => P(...F(p[0] + u * h, p[1] + v * h)).join(",")).join(" ");
  const sqLin = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => P(Fp[0] + Jp[0][0] * u * h + Jp[0][1] * v * h, Fp[1] + Jp[1][0] * u * h + Jp[1][1] * v * h).join(",")).join(" ");
  const det = Jp[0][0] * Jp[1][1] - Jp[0][1] * Jp[1][0];
  const [hx, hy] = P(...Fp);
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="A grid warped by a nonlinear map, with the local linear approximation">
        <defs><clipPath id="jwc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#jwc)">
          {lines}
          <polygon points={sqTrue} fill="var(--neuro)" opacity="0.35" stroke="var(--neuro)" />
          <polygon points={sqLin} fill="none" stroke="var(--ai)" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx={hx} cy={hy} r="9" fill="var(--ink)" opacity="0.45" {...drag.handle("p")} />
        </g>
      </svg>
      <div className="space-y-3">
        <Slider label="strength of the nonlinearity k" value={k} min={0} max={1.2} step={0.05} onChange={setK} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Jacobian J at the point" value={`[${Jp[0][0].toFixed(2)} ${Jp[0][1].toFixed(2)}; ${Jp[1][0].toFixed(2)} ${Jp[1][1].toFixed(2)}]`} />
          <Stat label="det J (local area scaling)" value={det.toFixed(3)} />
        </div>
        <p className="text-sm text-ink-2">The map F(x, y) = (x + k sin 1.5y, y + k tanh 1.5x) bends the grid. Drag the grey point. The pink patch is where F sends a small square; the blue dashed parallelogram is where the Jacobian, the matrix of partial derivatives at that point, sends it. Shrink the square in your mind and the two agree: locally, every smooth map is linear, and det J tells you how it scales area there.</p>
      </div>
    </div>
  );
}
