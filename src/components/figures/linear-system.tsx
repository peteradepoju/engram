"use client";

import { useState } from "react";
import { Slider } from "./util";
import { Arrow } from "./drag";

/** A 2 by 2 system two ways: the row picture (two lines that cross) and the column picture (combine columns to reach b). */
export function LinearSystem() {
  const [a11, setA11] = useState(2), [a12, setA12] = useState(1), [a21, setA21] = useState(1), [a22, setA22] = useState(3);
  const b = [4, 7];
  const det = a11 * a22 - a12 * a21;
  const sol = Math.abs(det) > 1e-6 ? [(b[0] * a22 - a12 * b[1]) / det, (a11 * b[1] - a21 * b[0]) / det] : null;
  const W = 260, C = W / 2, S = 22;
  const px = (x: number) => C + x * S, py = (y: number) => C - y * S;
  const lineFor = (p: number, q: number, r: number) => { // p x + q y = r
    if (Math.abs(q) > 1e-6) return [px(-6), py((r - p * -6) / q), px(6), py((r - p * 6) / q)];
    return [px(r / p), py(-6), px(r / p), py(6)];
  };
  const [l1x1, l1y1, l1x2, l1y2] = lineFor(a11, a12, b[0]);
  const [l2x1, l2y1, l2x2, l2y2] = lineFor(a21, a22, b[1]);
  const S2 = 14, C2 = 60;
  const qx = (x: number) => C2 + x * S2, qy = (y: number) => 200 - y * S2;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="eyebrow mb-1">Row picture</div>
          <svg viewBox={`0 0 ${W} ${W}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Two lines and their intersection">
            <defs><clipPath id="lsc"><rect width={W} height={W} /></clipPath></defs>
            <g clipPath="url(#lsc)">
              <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
              <line x1={l1x1} y1={l1y1} x2={l1x2} y2={l1y2} stroke="var(--neuro)" strokeWidth="2.5" />
              <line x1={l2x1} y1={l2y1} x2={l2x2} y2={l2y2} stroke="var(--ai)" strokeWidth="2.5" />
              {sol ? <circle cx={px(sol[0])} cy={py(sol[1])} r="6" fill="var(--accent)" /> : null}
            </g>
          </svg>
          <p className="mt-1 text-xs text-ink-3">Each equation is a line; the solution is where they cross.</p>
        </div>
        <div>
          <div className="eyebrow mb-1">Column picture</div>
          <svg viewBox="0 0 260 260" className="w-full rounded-lg bg-surface-2" role="img" aria-label="Combining columns to reach b">
            {sol ? (
              <>
                <Arrow id="lc1" x1={qx(0)} y1={qy(0)} x2={qx(sol[0] * a11)} y2={qy(sol[0] * a21)} color="var(--neuro)" />
                <Arrow id="lc2" x1={qx(sol[0] * a11)} y1={qy(sol[0] * a21)} x2={qx(sol[0] * a11 + sol[1] * a12)} y2={qy(sol[0] * a21 + sol[1] * a22)} color="var(--ai)" />
              </>
            ) : null}
            <circle cx={qx(b[0])} cy={qy(b[1])} r="6" fill="var(--accent)" />
            <text x={qx(b[0]) + 8} y={qy(b[1]) - 6} fontSize="12" fill="var(--accent)">b = (4, 7)</text>
            <circle cx={qx(0)} cy={qy(0)} r="3" fill="var(--ink)" />
          </svg>
          <p className="mt-1 text-xs text-ink-3">x₁ times column 1 plus x₂ times column 2 reaches b.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Slider label="a₁₁" value={a11} min={-3} max={3} step={0.5} onChange={setA11} />
        <Slider label="a₁₂" value={a12} min={-3} max={3} step={0.5} onChange={setA12} />
        <Slider label="a₂₁" value={a21} min={-3} max={3} step={0.5} onChange={setA21} />
        <Slider label="a₂₂" value={a22} min={-3} max={3} step={0.5} onChange={setA22} />
      </div>
      <div className="rounded-lg bg-surface-2 p-3 font-mono text-sm">
        {a11}x₁ + {a12}x₂ = 4 &nbsp;&nbsp; {a21}x₁ + {a22}x₂ = 7 &nbsp;&nbsp;→&nbsp;&nbsp; {sol ? `x = (${sol[0].toFixed(2)}, ${sol[1].toFixed(2)}), det = ${det.toFixed(2)}` : "det = 0: the lines are parallel (no solution or infinitely many)"}
      </div>
    </div>
  );
}
