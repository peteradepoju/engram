"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { Slider, Stat } from "./util";

const FNS: Record<string, { f: (w: number) => number; d: (w: number) => number; note: string }> = {
  bowl: { f: (w) => 0.5 * w * w, d: (w) => w, note: "a convex bowl: any small enough step reaches the bottom" },
  "two valleys": { f: (w) => 0.08 * (w * w - 4) ** 2 + 0.3 * w, d: (w) => 0.32 * w * (w * w - 4) + 0.3, note: "two valleys: which one you reach depends on where you start" },
  rugged: { f: (w) => 0.15 * w * w + 0.35 * Math.cos(3 * w), d: (w) => 0.3 * w - 1.05 * Math.sin(3 * w), note: "a rugged landscape: gradient descent stops in the first dip it finds" },
};

/** Gradient descent on a function of one variable. Drag the start and change the step size. */
export function Descent1D() {
  const [name, setName] = useState("two valleys");
  const [w0, setW0] = useState(2.6);
  const [lr, setLr] = useState(0.3);
  const F = FNS[name];
  const W = 540, H = 260, X = (w: number) => 30 + ((w + 3.5) / 7) * (W - 50);
  const ys = Array.from({ length: 281 }, (_, i) => F.f(-3.5 + i * 0.025));
  const lo = Math.min(...ys), hi = Math.max(...ys.filter((y) => Number.isFinite(y))), Y = (v: number) => 230 - ((v - lo) / (hi - lo || 1)) * 200;
  const drag = useSvgDrag((_, px) => setW0(Math.max(-3.4, Math.min(3.4, ((px - 30) / (W - 50)) * 7 - 3.5))));
  const path = [w0];
  for (let k = 0; k < 30; k++) { const w = path[path.length - 1]; const nw = w - lr * F.d(w); if (!Number.isFinite(nw) || Math.abs(nw) > 6) break; path.push(nw); }
  const last = path[path.length - 1];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(FNS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => setName(k)}>{k}</button>)}
      </div>
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Gradient descent steps on a curve">
        <defs><clipPath id="d1c"><rect x="0" y="0" width={W} height={H - 18} /></clipPath></defs>
        <polyline points={ys.map((y, i) => `${X(-3.5 + i * 0.025)},${Y(y)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <g clipPath="url(#d1c)">
          {path.slice(1).map((w, i) => <line key={`l${i}`} x1={X(path[i])} y1={Y(F.f(path[i]))} x2={X(w)} y2={Y(F.f(w))} stroke="var(--neuro)" strokeWidth="1.2" opacity="0.7" />)}
          {path.map((w, i) => <circle key={i} cx={X(w)} cy={Y(F.f(w))} r={i === 0 ? 0 : 3.5} fill="var(--neuro)" opacity={0.4 + 0.6 * (i / path.length)} />)}
        </g>
        <circle cx={X(w0)} cy={Y(F.f(w0))} r="9" fill="var(--ai)" {...drag.handle("w0")} />
        {[-3, -2, -1, 0, 1, 2, 3].map((w) => <text key={w} x={X(w)} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{w}</text>)}
        <text x={W - 10} y="16" fontSize="10" textAnchor="end" fill="var(--ink-3)">loss against the weight w; drag the blue start</text>
      </svg>
      <Slider label="learning rate η" value={lr} min={0.02} max={2.5} step={0.01} onChange={setLr} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="start w₀" value={w0.toFixed(2)} />
        <Stat label="after 30 steps" value={path.length < 31 ? "diverged" : last.toFixed(3)} />
        <Stat label="loss there" value={path.length < 31 ? "∞" : F.f(last).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each pink dot is one step w ← w − η dL/dw. Small steps creep; larger ones arrive faster; too large and they overshoot, bounce from wall to wall and can fly off altogether. Here: {F.note}.</p>
    </div>
  );
}
