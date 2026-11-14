"use client";

import { useMemo, useState } from "react";
import { gauss, polyEval, polyFit, rng, Slider, Stat } from "./util";

const f = (x: number): number => 0.8 * Math.sin(Math.PI * x);

/** Polynomial fits of increasing degree: training error falls while test error turns back up. */
export function PolyFit() {
  const [deg, setDeg] = useState(3);
  const { tr, te } = useMemo(() => {
    const r = rng(541);
    const mk = (m: number): [number, number][] => Array.from({ length: m }, () => { const x = 2 * r() - 1; return [x, f(x) + 0.3 * gauss(r)]; });
    return { tr: mk(15), te: mk(300) };
  }, []);
  const errs = useMemo(() => Array.from({ length: 13 }, (_, d): [number, number] => {
    const w = polyFit(tr.map((p) => p[0]), tr.map((p) => p[1]), d);
    const mse = (s: [number, number][]): number => s.reduce((acc, [x, y]) => acc + (y - polyEval(w, x)) ** 2, 0) / s.length;
    return [mse(tr), mse(te)];
  }), [tr, te]);
  const w = polyFit(tr.map((p) => p[0]), tr.map((p) => p[1]), deg);
  const sx = (x: number): number => 20 + (x + 1) * 100, sy = (y: number): number => 95 - y * 55;
  const ex = (d: number): number => 250 + d * 7.5, ey = (e: number): number => 150 - Math.min(Math.log10(e / 0.02) / Math.log10(50), 1) * 120;
  const grid = Array.from({ length: 121 }, (_, i): number => -1 + i / 60);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[500px] rounded-lg bg-surface-2" role="img" aria-label="Polynomial fit and error by degree">
        <defs><clipPath id="pfclip"><rect x="15" y="10" width="215" height="160" /></clipPath></defs>
        {te.slice(0, 80).map(([x, y], i) => <circle key={`t${i}`} cx={sx(x)} cy={sy(y)} r="1.6" fill="var(--ink-3)" opacity="0.5" />)}
        <polyline clipPath="url(#pfclip)" points={grid.map((x) => `${sx(x)},${sy(polyEval(w, x))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        {tr.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r="3" fill="var(--ink)" />)}
        <polyline points={errs.map((e, d) => `${ex(d)},${ey(e[0])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.6" />
        <polyline points={errs.map((e, d) => `${ex(d)},${ey(e[1])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.6" />
        <line x1={ex(deg)} x2={ex(deg)} y1="30" y2="150" stroke="var(--line)" strokeDasharray="2 2" />
        <text x="250" y="22" fontSize="8" fill="var(--ai)">training error</text>
        <text x="250" y="172" fontSize="8" fill="var(--neuro)">test error (log scale) by degree</text>
      </svg>
      <Slider label="polynomial degree" value={deg} min={0} max={12} step={1} onChange={setDeg} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="training MSE (15 points)" value={errs[deg][0].toFixed(3)} />
        <Stat label="test MSE (300 new points)" value={errs[deg][1].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Low degrees underfit: they cannot bend to follow the sine. High degrees overfit: they pass close to every training point and swing wildly between them. Training error only ever falls with degree; test error has a minimum near the noise level of 0.09.</p>
    </div>
  );
}
