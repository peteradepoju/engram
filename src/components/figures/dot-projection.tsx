"use client";

import { useState } from "react";
import { Arrow, useSvgDrag } from "./drag";
import { Stat } from "./util";

/** The dot product as projection. Drag a and b; see the angle, the shadow of a on b, and a·b. */
export function DotProjection() {
  const [a, setA] = useState({ x: 3, y: 2 });
  const [b, setB] = useState({ x: 4, y: -1 });
  const W = 320, C = W / 2, S = 30;
  const px = (v: number) => C + v * S, py = (v: number) => C - v * S;
  const inv = (x: number, y: number) => ({ x: Math.round(((x - C) / S) * 4) / 4, y: Math.round(((C - y) / S) * 4) / 4 });
  const drag = useSvgDrag((k, x, y) => (k === "a" ? setA(inv(x, y)) : setB(inv(x, y))));
  const dot = a.x * b.x + a.y * b.y;
  const na = Math.hypot(a.x, a.y), nb = Math.hypot(b.x, b.y) || 1e-9;
  const cos = dot / (na * nb || 1e-9);
  const ang = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  const t = dot / (nb * nb);
  const proj = { x: t * b.x, y: t * b.y };
  const colour = dot > 0.01 ? "var(--good)" : dot < -0.01 ? "var(--bad)" : "var(--ink-2)";
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Projection of vector a onto vector b">
        <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
        <line x1={px(-b.x * 3)} y1={py(-b.y * 3)} x2={px(b.x * 3)} y2={py(b.y * 3)} stroke="var(--ai)" opacity="0.2" />
        <line x1={px(a.x)} y1={py(a.y)} x2={px(proj.x)} y2={py(proj.y)} stroke="var(--ink-3)" strokeDasharray="4 3" />
        <line x1={px(0)} y1={py(0)} x2={px(proj.x)} y2={py(proj.y)} stroke={colour} strokeWidth="7" opacity="0.45" strokeLinecap="round" />
        <Arrow id="pa" x1={px(0)} y1={py(0)} x2={px(a.x)} y2={py(a.y)} color="var(--neuro)" />
        <Arrow id="pb" x1={px(0)} y1={py(0)} x2={px(b.x)} y2={py(b.y)} color="var(--ai)" />
        <circle cx={px(a.x)} cy={py(a.y)} r="10" fill="var(--neuro)" opacity="0.3" {...drag.handle("a")} />
        <circle cx={px(b.x)} cy={py(b.y)} r="10" fill="var(--ai)" opacity="0.3" {...drag.handle("b")} />
        <text x={px(a.x) + 10} y={py(a.y) - 6} fontSize="13" fontWeight="700" fill="var(--neuro)">a</text>
        <text x={px(b.x) + 10} y={py(b.y) - 6} fontSize="13" fontWeight="700" fill="var(--ai)">b</text>
      </svg>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="a · b = a₁b₁ + a₂b₂" value={dot.toFixed(2)} />
          <Stat label="angle between them" value={`${ang.toFixed(0)}°`} />
          <Stat label="cos θ = a·b / (‖a‖‖b‖)" value={cos.toFixed(2)} />
          <Stat label="shadow of a on b = a·b / ‖b‖" value={(dot / nb).toFixed(2)} />
        </div>
        <p className="text-sm text-ink-2">The thick line is the shadow (projection) of <strong>a</strong> on the direction of <strong>b</strong>: green when they point the same way (positive dot product), red when opposed (negative), and zero length when they are at right angles. Make them perpendicular and watch a·b reach 0.</p>
      </div>
    </div>
  );
}
