"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { Stat } from "./util";

const FNS: Record<string, (x: number) => number> = {
  "x²": (x) => x * x / 3,
  "e^x": (x) => Math.exp(x / 1.5) / 2,
  "|x|": (x) => Math.abs(x) * 0.8,
  "softplus": (x) => Math.log(1 + Math.exp(1.5 * x)),
  "sin x": (x) => Math.sin(1.3 * x) + 1.5,
  "double well": (x) => 0.12 * (x * x - 4) ** 2 / 2,
};

/** A function is convex when every chord lies on or above its graph. Drag the chord's ends. */
export function ConvexChord() {
  const [name, setName] = useState("double well");
  const [a, setA] = useState(-2.2);
  const [b, setB] = useState(2.0);
  const f = FNS[name];
  const W = 540, H = 250, X = (x: number) => 30 + ((x + 3) / 6) * (W - 50);
  const ys = Array.from({ length: 241 }, (_, i) => f(-3 + i * 0.025));
  const lo = Math.min(...ys), hi = Math.max(...ys), Y = (v: number) => 225 - ((v - lo) / (hi - lo || 1)) * 195;
  const drag = useSvgDrag((k, px) => { const x = Math.max(-2.95, Math.min(2.95, ((px - 30) / (W - 50)) * 6 - 3)); if (k === "a") setA(x); else setB(x); });
  let worst = 0, worstX = a;
  for (let i = 0; i <= 100; i++) { const th = i / 100, x = (1 - th) * a + th * b, gap = (1 - th) * f(a) + th * f(b) - f(x); if (gap < worst) { worst = gap; worstX = x; } }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(FNS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => setName(k)}>{k}</button>)}
      </div>
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="A function and a chord between two points">
        <polyline points={ys.map((y, i) => `${X(-3 + i * 0.025)},${Y(y)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <line x1={X(a)} y1={Y(f(a))} x2={X(b)} y2={Y(f(b))} stroke={worst < -1e-9 ? "var(--bad)" : "var(--good)"} strokeWidth="2.5" />
        {worst < -1e-9 ? <line x1={X(worstX)} x2={X(worstX)} y1={Y(f(worstX))} y2={Y(f(worstX) + worst)} stroke="var(--bad)" strokeDasharray="3 3" /> : null}
        <circle cx={X(a)} cy={Y(f(a))} r="8" fill="var(--neuro)" {...drag.handle("a")} />
        <circle cx={X(b)} cy={Y(f(b))} r="8" fill="var(--ai)" {...drag.handle("b")} />
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="chord above the graph everywhere between?" value={worst < -1e-9 ? "no: dips above the chord" : "yes"} />
        <Stat label="largest violation" value={worst < -1e-9 ? (-worst).toFixed(3) : "none"} />
      </div>
      <p className="text-sm text-ink-2">Drag the two ends of the chord. A function is convex if, for every pair of points, the straight chord between them never passes below the graph. x², eˣ, |x| and softplus are convex wherever you put the ends; for sin x and the double well you can find chords that the graph rises above (red). Convex functions have no false valleys: any local minimum is the global one.</p>
    </div>
  );
}
