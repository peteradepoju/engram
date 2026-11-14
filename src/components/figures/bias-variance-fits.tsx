"use client";

import { useMemo, useState } from "react";
import { gauss, polyEval, polyFit, rng, Slider, Stat } from "./util";

const f = (x: number): number => 0.8 * Math.sin(Math.PI * x);

/** Fits to twenty independent training sets: their spread is the variance, their average's error the bias. */
export function BiasVarianceFits() {
  const [deg, setDeg] = useState(3);
  const grid = Array.from({ length: 61 }, (_, i): number => -1 + i / 30);
  const fits = useMemo(() => {
    const r = rng(544);
    return Array.from({ length: 20 }, () => {
      const xs = Array.from({ length: 20 }, () => 2 * r() - 1), ys = xs.map((x) => f(x) + 0.3 * gauss(r));
      const w = polyFit(xs, ys, deg);
      return grid.map((x) => polyEval(w, x));
    });
  }, [deg]);
  const mean = grid.map((_, j) => fits.reduce((s, c) => s + c[j], 0) / fits.length);
  const bias2 = grid.reduce((s, x, j) => s + (mean[j] - f(x)) ** 2, 0) / grid.length;
  const vari = grid.reduce((s, _, j) => s + fits.reduce((t, c) => t + (c[j] - mean[j]) ** 2, 0) / fits.length, 0) / grid.length;
  const sx = (x: number): number => 20 + (x + 1) * 150, sy = (y: number): number => 85 - Math.max(-1.6, Math.min(1.6, y)) * 45;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Twenty fits and their average">
        {fits.map((c, i) => <polyline key={i} points={c.map((y, j) => `${sx(grid[j])},${sy(y)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1" opacity="0.35" />)}
        <polyline points={grid.map((x) => `${sx(x)},${sy(f(x))}`).join(" ")} fill="none" stroke="var(--ink)" strokeDasharray="4 3" strokeWidth="1.5" />
        <polyline points={mean.map((y, j) => `${sx(grid[j])},${sy(y)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.2" />
        <text x="24" y="14" fontSize="8" fill="var(--ai)">20 fits</text>
        <text x="62" y="14" fontSize="8" fill="var(--neuro)">their average</text>
        <text x="122" y="14" fontSize="8" fill="var(--ink)">truth</text>
      </svg>
      <Slider label="polynomial degree" value={deg} min={0} max={10} step={1} onChange={setDeg} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="bias²" value={bias2.toFixed(3)} />
        <Stat label="variance" value={vari.toFixed(3)} />
        <Stat label="noise" value="0.090" />
      </div>
      <p className="text-sm text-ink-2">Each faint curve is fitted to its own 20 noisy points. A straight line is stable but wrong everywhere (high bias); a degree-10 polynomial is right on average but different every time (high variance). Expected test error is the sum of the three numbers.</p>
    </div>
  );
}
