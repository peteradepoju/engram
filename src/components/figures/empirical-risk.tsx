"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const f = (x: number): number => 0.8 * Math.sin(Math.PI * x);
const SIG = 0.3;

/** Training (empirical) risk against expected risk for a straight line, with the line that minimises the training risk. */
export function EmpiricalRisk() {
  const [n, setN] = useState(10);
  const [a, setA] = useState(0.5);
  const [b, setB] = useState(0);
  const data = useMemo(() => { const r = rng(54); return Array.from({ length: 50 }, () => { const x = 2 * r() - 1; return [x, f(x) + SIG * gauss(r)] as [number, number]; }); }, []);
  const pts = data.slice(0, n);
  const train = pts.reduce((s, [x, y]) => s + (y - (a * x + b)) ** 2, 0) / n;
  const grid = Array.from({ length: 401 }, (_, i): number => -1 + i / 200);
  const expected = (aa: number, bb: number): number => grid.reduce((s, x) => s + (f(x) - aa * x - bb) ** 2, 0) / grid.length + SIG * SIG;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  const sxy = pts.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0), sxx = pts.reduce((s, [x]) => s + (x - mx) ** 2, 0);
  const aHat = sxy / (sxx || 1e-9), bHat = my - aHat * mx;
  const trainHat = pts.reduce((s, [x, y]) => s + (y - (aHat * x + bHat)) ** 2, 0) / n;
  const sx = (x: number): number => 30 + (x + 1) * 150, sy = (y: number): number => 95 - y * 60;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 190" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="A line fitted to noisy data">
        <line x1="30" x2="330" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <polyline points={grid.filter((_, i) => i % 4 === 0).map((x) => `${sx(x)},${sy(f(x))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <line x1={sx(-1)} x2={sx(1)} y1={sy(bHat - aHat)} y2={sy(bHat + aHat)} stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="6 3" />
        <line x1={sx(-1)} x2={sx(1)} y1={sy(b - a)} y2={sy(b + a)} stroke="var(--neuro)" strokeWidth="2.2" />
        {pts.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r="3" fill="var(--ink)" />)}
        <text x="34" y="14" fontSize="8" fill="var(--neuro)">your line</text>
        <text x="80" y="14" fontSize="8" fill="var(--ai)">line with the least training error</text>
        <text x="220" y="14" fontSize="8" fill="var(--ink-3)">true function</text>
      </svg>
      <Slider label="training points n" value={n} min={3} max={50} step={1} onChange={setN} />
      <Slider label="slope" value={a} min={-1.5} max={1.5} step={0.05} onChange={setA} fmt={(v) => v.toFixed(2)} />
      <Slider label="intercept" value={b} min={-0.6} max={0.6} step={0.02} onChange={setB} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="your line: training / expected risk" value={`${train.toFixed(3)} / ${expected(a, b).toFixed(3)}`} />
        <Stat label="best line: training / expected risk" value={`${trainHat.toFixed(3)} / ${expected(aHat, bHat).toFixed(3)}`} />
      </div>
      <p className="text-sm text-ink-2">The training risk is an average over the points you have; the expected risk is the average over all the data the line will ever meet, including the irreducible noise (0.09 here). With few points, the line that minimises training risk is often far from the best line, and its training risk flatters it.</p>
    </div>
  );
}
