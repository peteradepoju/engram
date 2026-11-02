"use client";

import { useState } from "react";

const F = [[0, 0], [0, 3], [2, 3], [2, 2.4], [0.6, 2.4], [0.6, 1.8], [1.6, 1.8], [1.6, 1.2], [0.6, 1.2], [0.6, 0]];
const MATS: Record<string, number[][]> = {
  "rotate 90°": [[0, -1], [1, 0]],
  "shear": [[1, 0.8], [0, 1]],
  "stretch x": [[1.6, 0], [0, 1]],
  "reflect": [[-1, 0], [0, 1]],
};
const apply = (M: number[][], [x, y]: number[]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
const mul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r[0] * B[0][j] + r[1] * B[1][j]));

/** Apply A then B, or B then A: matrix multiplication is composition, and order matters. */
export function Compose() {
  const [A, setA] = useState("rotate 90°");
  const [B, setB] = useState("shear");
  const W = 200, C = W / 2, S = 18;
  const poly = (pts: number[][], colour: string) => <polygon points={pts.map(([x, y]) => `${C + x * S},${C - y * S}`).join(" ")} fill={colour} opacity="0.55" stroke={colour} />;
  const BA = mul(MATS[B], MATS[A]), AB = mul(MATS[A], MATS[B]);
  const panel = (title: string, pts: number[][], colour: string, M?: number[][]) => (
    <div className="text-center">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label={title}>
        <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
        {poly(F, "var(--ink-3)")}{poly(pts, colour)}
      </svg>
      <div className="mt-1 text-sm font-semibold">{title}</div>
      {M ? <div className="font-mono text-xs text-ink-3">[{M.map((r) => r.map((v) => v.toFixed(1)).join(" ")).join("; ")}]</div> : null}
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-2">A =</span>
        {Object.keys(MATS).map((k) => <button key={k} className={`chip !py-1 ${A === k ? "!bg-neuro !text-white" : ""}`} onClick={() => setA(k)}>{k}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-2">B =</span>
        {Object.keys(MATS).map((k) => <button key={k} className={`chip !py-1 ${B === k ? "!bg-ai !text-white" : ""}`} onClick={() => setB(k)}>{k}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {panel("A applied", F.map((p) => apply(MATS[A], p)), "var(--neuro)", MATS[A])}
        {panel("B applied", F.map((p) => apply(MATS[B], p)), "var(--ai)", MATS[B])}
        {panel("A first, then B: BA", F.map((p) => apply(BA, p)), "var(--accent)", BA)}
        {panel("B first, then A: AB", F.map((p) => apply(AB, p)), "var(--warn)", AB)}
      </div>
      <p className="text-sm text-ink-2">The grey F is the input. Doing A and then B is the single matrix BA (read right to left). For most pairs BA and AB differ, so the two right panels differ: matrix multiplication is not commutative. Try two stretches, or rotate with rotate, and see when they agree.</p>
    </div>
  );
}
