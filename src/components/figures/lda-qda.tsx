"use client";

import React, { useState } from "react";
import { Slider, Stat } from "./util";

/** Linear and quadratic discriminant boundaries for two Gaussian classes with equal or unequal spreads. */
export function LdaQda() {
  const [spread, setSpread] = useState(2);
  const [gap, setGap] = useState(1.5);
  const m0 = [-gap / 2, 0], m1 = [gap / 2, 0];
  const s0 = 0.6, s1 = 0.6 * spread;
  const logN = (x: number, y: number, m: number[], s: number): number => -Math.log(2 * Math.PI * s * s) - ((x - m[0]) ** 2 + (y - m[1]) ** 2) / (2 * s * s);
  const sPool = Math.sqrt((s0 * s0 + s1 * s1) / 2);
  const qda = (x: number, y: number): number => logN(x, y, m1, s1) - logN(x, y, m0, s0);
  const lda = (x: number, y: number): number => logN(x, y, m1, sPool) - logN(x, y, m0, sPool);
  const cells: React.ReactElement[] = [];
  let errQ = 0, errL = 0, tot = 0;
  for (let i = 0; i < 64; i++) for (let j = 0; j < 36; j++) {
    const x = -4 + i * 0.125 + 0.0625, y = -2.25 + j * 0.125 + 0.0625;
    const q = qda(x, y), l = lda(x, y);
    const d0 = Math.exp(logN(x, y, m0, s0)), d1 = Math.exp(logN(x, y, m1, s1));
    errQ += q > 0 ? d0 : d1; errL += l > 0 ? d0 : d1; tot += d0 + d1;
    cells.push(<rect key={`${i}-${j}`} x={10 + i * 5} y={185 - (j + 1) * 5} width="5" height="5" fill={q > 0 ? "var(--neuro)" : "var(--ai)"} opacity="0.18" />);
  }
  const sx = (v: number): number => 10 + (v + 4) * 40, sy = (v: number): number => 185 - (v + 2.25) * 40;
  const xb = -(gap) * 0 + 0;
  const circ = (m: number[], s: number): string => Array.from({ length: 61 }, (_, i): string => `${sx(m[0] + 2 * s * Math.cos((i * Math.PI) / 30))},${sy(m[1] + 2 * s * Math.sin((i * Math.PI) / 30))}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 190" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="LDA and QDA boundaries">
        {cells}
        <polyline points={circ(m0, s0)} fill="none" stroke="var(--ai)" strokeWidth="1.5" />
        <polyline points={circ(m1, s1)} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
        <line x1={sx(xb)} x2={sx(xb)} y1="5" y2="185" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="14" y="14" fontSize="8" fill="var(--ink)">dashed: LDA boundary; shading: QDA decision</text>
      </svg>
      <Slider label="spread of class 2 relative to class 1" value={spread} min={0.5} max={3} step={0.05} onChange={setSpread} fmt={(v) => v.toFixed(2)} />
      <Slider label="distance between means" value={gap} min={0} max={3} step={0.1} onChange={setGap} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="error rate, LDA" value={(errL / tot).toFixed(3)} />
        <Stat label="error rate, QDA" value={(errQ / tot).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Circles mark two standard deviations of each class. LDA assumes both classes share one covariance, so its boundary is a straight line midway between them. QDA lets each class have its own covariance; when one class is more spread out, the best boundary curves around the tighter class, and QDA's error is lower.</p>
    </div>
  );
}
