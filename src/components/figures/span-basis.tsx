"use client";

import { useState } from "react";
import { Arrow, useSvgDrag } from "./drag";
import { Slider } from "./util";

/** Linear combinations c1 u + c2 v. Drag the basis vectors; make them parallel and the span collapses to a line. */
export function SpanBasis() {
  const [u, setU] = useState({ x: 2, y: 0.5 });
  const [v, setV] = useState({ x: 0.5, y: 1.5 });
  const [c1, setC1] = useState(1.5);
  const [c2, setC2] = useState(1);
  const W = 320, C = W / 2, S = 26;
  const px = (x: number) => C + x * S, py = (y: number) => C - y * S;
  const inv = (x: number, y: number) => ({ x: Math.round(((x - C) / S) * 4) / 4, y: Math.round(((C - y) / S) * 4) / 4 });
  const drag = useSvgDrag((k, x, y) => (k === "u" ? setU(inv(x, y)) : setV(inv(x, y))));
  const det = u.x * v.y - u.y * v.x;
  const w = { x: c1 * u.x + c2 * v.x, y: c1 * u.y + c2 * v.y };
  const grid: [number, number][] = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) grid.push([i, j]);
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Linear combinations of two basis vectors">
        <defs><clipPath id="spc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#spc)">
          {grid.map(([i, j]) => <circle key={`${i},${j}`} cx={px(i * u.x + j * v.x)} cy={py(i * u.y + j * v.y)} r="2" fill="var(--ink-3)" opacity="0.5" />)}
          {Math.abs(det) < 0.05 ? <line x1={px(-20 * (u.x || v.x))} y1={py(-20 * (u.y || v.y))} x2={px(20 * (u.x || v.x))} y2={py(20 * (u.y || v.y))} stroke="var(--bad)" strokeWidth="3" opacity="0.5" /> : null}
          <line x1={px(c1 * u.x)} y1={py(c1 * u.y)} x2={px(w.x)} y2={py(w.y)} stroke="var(--ai)" strokeDasharray="4 3" />
          <Arrow id="sw" x1={px(0)} y1={py(0)} x2={px(w.x)} y2={py(w.y)} color="var(--accent)" width={3} />
          <Arrow id="su" x1={px(0)} y1={py(0)} x2={px(u.x)} y2={py(u.y)} color="var(--neuro)" />
          <Arrow id="sv" x1={px(0)} y1={py(0)} x2={px(v.x)} y2={py(v.y)} color="var(--ai)" />
          <circle cx={px(u.x)} cy={py(u.y)} r="10" fill="var(--neuro)" opacity="0.3" {...drag.handle("u")} />
          <circle cx={px(v.x)} cy={py(v.y)} r="10" fill="var(--ai)" opacity="0.3" {...drag.handle("v")} />
          <text x={px(u.x) + 8} y={py(u.y) - 8} fontSize="13" fontWeight="700" fill="var(--neuro)">u</text>
          <text x={px(v.x) + 8} y={py(v.y) - 8} fontSize="13" fontWeight="700" fill="var(--ai)">v</text>
        </g>
      </svg>
      <div className="space-y-3">
        <Slider label="c₁ (amount of u)" value={c1} min={-3} max={3} step={0.25} onChange={setC1} fmt={(x) => x.toFixed(2)} />
        <Slider label="c₂ (amount of v)" value={c2} min={-3} max={3} step={0.25} onChange={setC2} fmt={(x) => x.toFixed(2)} />
        <div className="rounded-lg bg-surface-2 p-3 font-mono text-sm">w = {c1}·u + {c2}·v = ({w.x.toFixed(2)}, {w.y.toFixed(2)})</div>
        <p className="text-sm text-ink-2">
          {Math.abs(det) < 0.05
            ? "u and v are parallel (linearly dependent): every combination lies on one line, the red line. They span only one dimension, so they are not a basis for the plane."
            : "The dots are all combinations with whole-number coefficients. u and v are independent, so together they reach every point in the plane: they form a basis, and each point has exactly one pair (c₁, c₂)."}
        </p>
      </div>
    </div>
  );
}
