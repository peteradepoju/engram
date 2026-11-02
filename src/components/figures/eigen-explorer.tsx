"use client";

import { useState } from "react";
import { Arrow, useSvgDrag } from "./drag";
import { eig2 } from "./linalg";
import { Slider, Stat } from "./util";

const PRESETS: Record<string, [number, number, number, number]> = {
  stretch: [2, 0, 0, 0.5], "symmetric": [2, 1, 1, 2], shear: [1, 1, 0, 1], rotate: [0, -1, 1, 0], "flip": [0, 1, 1, 0], "mixed": [1.5, 0.8, 0.3, 0.7],
};

/** Drag x and watch Ax. Eigenvectors are the directions where Ax lands on the same line as x. */
export function EigenExplorer() {
  const [m, setM] = useState<[number, number, number, number]>([2, 1, 1, 2]);
  const [x, setX] = useState<[number, number]>([1, 0.3]);
  const [a, b, c, d] = m;
  const set = (i: number) => (v: number) => setM((old) => old.map((q, k) => (k === i ? v : q)) as [number, number, number, number]);
  const W = 320, C = W / 2, S = 34;
  const drag = useSvgDrag((_, X, Y) => {
    const nx = (X - C) / S, ny = (C - Y) / S, r = Math.hypot(nx, ny) || 1;
    setX([nx / r * 1.6, ny / r * 1.6]);
  });
  const ax = a * x[0] + b * x[1], ay = c * x[0] + d * x[1];
  const cross = x[0] * ay - x[1] * ax, ang = Math.abs(Math.atan2(cross, x[0] * ax + x[1] * ay)) * 180 / Math.PI;
  const along = Math.min(ang, 180 - ang) < 2 && Math.hypot(ax, ay) > 1e-6;
  const e = eig2(a, b, c, d);
  const P = (u: number, v: number) => [C + u * S, C - v * S];
  const line = (v: number[] | null, key: string) => v ? <line key={key} x1={P(-6 * v[0], -6 * v[1])[0]} y1={P(-6 * v[0], -6 * v[1])[1]} x2={P(6 * v[0], 6 * v[1])[0]} y2={P(6 * v[0], 6 * v[1])[1]} stroke="var(--warn)" strokeDasharray="5 4" opacity="0.8" /> : null;
  const [hx, hy] = P(x[0], x[1]), [tx, ty] = P(ax, ay);
  const fmt = (v: number) => v.toFixed(2);
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="A vector x and its image Ax">
        <defs><clipPath id="eec"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#eec)">
          {Array.from({ length: 11 }, (_, i) => i - 5).map((i) => <g key={i}><line x1={C + i * S} x2={C + i * S} y1="0" y2={W} stroke="var(--line)" /><line y1={C + i * S} y2={C + i * S} x1="0" x2={W} stroke="var(--line)" /></g>)}
          <circle cx={C} cy={C} r={1.6 * S} fill="none" stroke="var(--ink-3)" strokeDasharray="2 4" />
          {e.real ? [line(e.v1, "l1"), line(e.v2, "l2")] : null}
          <Arrow id="eeax" x1={C} y1={C} x2={tx} y2={ty} color="var(--ai)" width={3} />
          <Arrow id="eex" x1={C} y1={C} x2={hx} y2={hy} color="var(--neuro)" width={3} />
          <circle cx={hx} cy={hy} r="9" fill="var(--neuro)" opacity="0.35" {...drag.handle("x")} />
        </g>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PRESETS).map(([name, v]) => <button key={name} className="chip !py-1" onClick={() => setM(v)}>{name}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Slider label="a (top left)" value={a} min={-2} max={2} step={0.1} onChange={set(0)} fmt={(v) => v.toFixed(1)} />
          <Slider label="b (top right)" value={b} min={-2} max={2} step={0.1} onChange={set(1)} fmt={(v) => v.toFixed(1)} />
          <Slider label="c (bottom left)" value={c} min={-2} max={2} step={0.1} onChange={set(2)} fmt={(v) => v.toFixed(1)} />
          <Slider label="d (bottom right)" value={d} min={-2} max={2} step={0.1} onChange={set(3)} fmt={(v) => v.toFixed(1)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="angle between x and Ax" value={`${ang.toFixed(1)}°`} />
          <Stat label={along ? "eigenvector! λ = |Ax| / |x| (with sign)" : "length ratio |Ax| / |x|"} value={along ? fmt((ax * x[0] + ay * x[1]) / (x[0] ** 2 + x[1] ** 2)) : fmt(Math.hypot(ax, ay) / 1.6)} />
          <Stat label="eigenvalues" value={e.real ? `${fmt(e.l1)}, ${fmt(e.l2)}` : `${fmt(e.l1)} ± ${fmt(e.im)}i`} />
          <Stat label="eigen-directions (dashed)" value={e.real ? "2 real lines" : "none: it rotates"} />
        </div>
        <p className="text-sm text-ink-2">Drag the pink vector x around the circle; the blue arrow is Ax. Most directions get knocked off their line. Along the dashed lines, Ax points the same way as x (or exactly opposite): those are the eigenvectors, and the stretch factor is the eigenvalue. A rotation has no such line, so its eigenvalues are complex.</p>
      </div>
    </div>
  );
}
