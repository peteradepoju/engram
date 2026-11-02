"use client";

import { useState } from "react";
import { Arrow } from "./drag";
import { Slider, Stat } from "./util";

const PRESETS: Record<string, [number, number, number, number]> = {
  identity: [1, 0, 0, 1], "scale x2": [2, 0, 0, 2], stretch: [1.8, 0, 0, 0.6], rotate: [Math.cos(0.6), -Math.sin(0.6), Math.sin(0.6), Math.cos(0.6)],
  shear: [1, 0.8, 0, 1], reflect: [-1, 0, 0, 1], squash: [1, 2, 0.5, 1],
};

/** A 2 by 2 matrix moves every point of the plane. Its columns are where the basis vectors land. */
export function MatrixTransform() {
  const [m, setM] = useState<[number, number, number, number]>([1, 0.8, 0, 1]);
  const [a, b, c, d] = m;
  const set = (i: number) => (v: number) => setM((old) => old.map((x, k) => (k === i ? v : x)) as [number, number, number, number]);
  const W = 320, C = W / 2, S = 40;
  const T = (x: number, y: number) => [C + (a * x + b * y) * S, C - (c * x + d * y) * S];
  const det = a * d - b * c;
  const lines = [];
  for (let i = -4; i <= 4; i++) {
    const [x1, y1] = T(i, -4), [x2, y2] = T(i, 4), [x3, y3] = T(-4, i), [x4, y4] = T(4, i);
    lines.push(<line key={`v${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" opacity={i === 0 ? 0.6 : 0.25} />);
    lines.push(<line key={`h${i}`} x1={x3} y1={y3} x2={x4} y2={y4} stroke="var(--accent)" opacity={i === 0 ? 0.6 : 0.25} />);
  }
  const sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => T(x, y).join(",")).join(" ");
  const [ix, iy] = T(1, 0), [jx, jy] = T(0, 1);
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="A grid transformed by a matrix">
        <defs><clipPath id="mtc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#mtc)">
          {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => <g key={i}><line x1={C + i * S} x2={C + i * S} y1="0" y2={W} stroke="var(--line)" /><line y1={C + i * S} y2={C + i * S} x1="0" x2={W} stroke="var(--line)" /></g>)}
          {lines}
          <polygon points={sq} fill="var(--warn)" opacity="0.3" stroke="var(--warn)" />
          <Arrow id="mti" x1={C} y1={C} x2={ix} y2={iy} color="var(--neuro)" width={3} />
          <Arrow id="mtj" x1={C} y1={C} x2={jx} y2={jy} color="var(--ai)" width={3} />
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
          <Stat label="first column (where i lands)" value={`(${a.toFixed(1)}, ${c.toFixed(1)})`} />
          <Stat label="second column (where j lands)" value={`(${b.toFixed(1)}, ${d.toFixed(1)})`} />
          <Stat label="area of the unit square: det" value={det.toFixed(2)} />
          <Stat label="invertible?" value={Math.abs(det) < 0.01 ? "no: flattened" : "yes"} />
        </div>
        <p className="text-sm text-ink-2">The pink and blue arrows are the images of the basis vectors i = (1, 0) and j = (0, 1): they are the columns of the matrix. Grid lines stay straight, parallel and evenly spaced: that is what makes the map linear. The orange square's area is scaled by the determinant; at zero the plane is squashed onto a line.</p>
      </div>
    </div>
  );
}
