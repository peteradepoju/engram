"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const XS = Array.from({ length: 121 }, (_, i): number => -3 + i * 0.05);
const COLS = ["var(--neuro)", "var(--ai)", "var(--warn)", "var(--good)", "var(--ink-3)"];

/** Functions drawn from Bayesian linear regression on M Gaussian bumps, with prior variance scaled by 1/M: as M grows they become draws from a Gaussian process. */
export function BlrToGp() {
  const [M, setM] = useState(5);
  const fs = useMemo(() => {
    const r = rng(641);
    const centres = Array.from({ length: M }, (_, i) => (M === 1 ? 0 : -4 + (8 * i) / (M - 1)));
    const width = Math.max(0.3, 8 / M);
    return Array.from({ length: 5 }, () => {
      const w = centres.map(() => gauss(r) * Math.sqrt(8 / (M * Math.sqrt(Math.PI) * width)) );
      return XS.map((x) => centres.reduce((s, c, j) => s + w[j] * Math.exp(-0.5 * ((x - c) / width) ** 2), 0));
    });
  }, [M]);
  const sx = (x: number): number => 20 + ((x + 3) / 6) * 300, sy = (y: number): number => 85 - y * 25;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Sampled functions">
        <line x1="20" x2="320" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {fs.map((f, k) => <polyline key={k} points={f.map((y, i) => `${sx(XS[i])},${Math.max(4, Math.min(166, sy(y)))}`).join(" ")} fill="none" stroke={COLS[k]} strokeWidth="1.6" />)}
      </svg>
      <Slider label="number of basis functions M" value={M} min={1} max={80} step={1} onChange={setM} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="weights per function" value={`${M}`} />
        <Stat label="width of each bump" value={Math.max(0.3, 8 / M).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Each curve is a draw from the prior of a Bayesian linear regression on M bumps spread across the axis. With few bumps the functions are visibly built from them; with many, scaled so that the total variance stays fixed, they become smooth random functions whose statistics depend only on a kernel. In the limit no weights remain, only the kernel: a Gaussian process.</p>
    </div>
  );
}
