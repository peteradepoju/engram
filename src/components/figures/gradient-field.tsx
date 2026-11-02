"use client";

import { useState } from "react";
import { Arrow, useSvgDrag } from "./drag";
import { Stat } from "./util";

type Surf = { f: (x: number, y: number) => number; g: (x: number, y: number) => [number, number]; note: string };
const SURFS: Record<string, Surf> = {
  bowl: { f: (x, y) => x * x + y * y, g: (x, y) => [2 * x, 2 * y], note: "a round bowl: the gradient points straight away from the minimum" },
  "long valley": { f: (x, y) => 0.3 * x * x + 3 * y * y, g: (x, y) => [0.6 * x, 6 * y], note: "a long valley: the gradient points mostly across the valley, not along it" },
  "two hills": {
    f: (x, y) => -2 * Math.exp(-((x - 1) ** 2 + y * y)) - 1.5 * Math.exp(-((x + 1.2) ** 2 + (y - 0.8) ** 2) / 0.6),
    g: (x, y) => {
      const a = 2 * Math.exp(-((x - 1) ** 2 + y * y)), b = 1.5 * Math.exp(-((x + 1.2) ** 2 + (y - 0.8) ** 2) / 0.6);
      return [a * 2 * (x - 1) + b * 2 * (x + 1.2) / 0.6, a * 2 * y + b * 2 * (y - 0.8) / 0.6];
    },
    note: "two dips: the gradient only knows about the slope where you stand",
  },
};

/** A function of two variables as a heat map, with the gradient at a point you drag. */
export function GradientField() {
  const [name, setName] = useState("long valley");
  const [p, setP] = useState<[number, number]>([1.8, 1.2]);
  const S = SURFS[name];
  const W = 340, C = W / 2, K = 60, n = 34;
  const P = (x: number, y: number) => [C + x * K, C - y * K];
  const drag = useSvgDrag((_, X, Y) => setP([Math.max(-2.7, Math.min(2.7, (X - C) / K)), Math.max(-2.7, Math.min(2.7, (C - Y) / K))]));
  const vals: number[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) vals.push(S.f(-2.83 + (j + 0.5) * (5.66 / n), 2.83 - (i + 0.5) * (5.66 / n)));
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const cells = vals.map((v, k) => {
    const t = (v - lo) / (hi - lo || 1), b = Math.floor(Math.sqrt(t) * 10), band = b / 10;
    return <rect key={k} x={(k % n) * (W / n)} y={Math.floor(k / n) * (W / n)} width={W / n + 1} height={W / n + 1} shapeRendering="crispEdges" fill="var(--accent)" opacity={0.08 + 0.7 * (1 - band) + (b % 2 ? 0.12 : 0)} />;
  });
  const [gx, gy] = S.g(p[0], p[1]), gn = Math.hypot(gx, gy) || 1, L = Math.min(1.2, 0.35 * gn) / gn;
  const [px, py] = P(p[0], p[1]), [ax, ay] = P(p[0] + gx * L, p[1] + gy * L), [bx, by] = P(p[0] - gx * L, p[1] - gy * L);
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Heat map of a function with its gradient">
        {cells}
        <Arrow id="gfa" x1={px} y1={py} x2={ax} y2={ay} color="var(--neuro)" width={3} />
        <Arrow id="gfb" x1={px} y1={py} x2={bx} y2={by} color="var(--ai)" width={3} />
        <circle cx={px} cy={py} r="9" fill="var(--ink)" opacity="0.5" {...drag.handle("p")} />
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(SURFS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => setName(k)}>{k}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="point (w₁, w₂)" value={`(${p[0].toFixed(2)}, ${p[1].toFixed(2)})`} />
          <Stat label="f(w₁, w₂)" value={S.f(p[0], p[1]).toFixed(3)} />
          <Stat label="∂f/∂w₁, ∂f/∂w₂" value={`${gx.toFixed(2)}, ${gy.toFixed(2)}`} />
          <Stat label="|∇f|" value={Math.hypot(gx, gy).toFixed(3)} />
        </div>
        <p className="text-sm text-ink-2">Deeper colour means lower. Drag the grey point. The pink arrow is the gradient ∇f, the direction of steepest increase; the blue arrow is −∇f, the way downhill. Both are at right angles to the bands of equal height. Here: {S.note}.</p>
      </div>
    </div>
  );
}
