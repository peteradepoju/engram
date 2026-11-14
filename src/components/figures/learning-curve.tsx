"use client";

import { useMemo, useState } from "react";
import { gauss, polyEval, polyFit, rng, Slider, Stat } from "./util";

const f = (x: number): number => 0.8 * Math.sin(Math.PI * x);
const NS = [8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256];

/** Training and validation error as the training set grows, for a simple and a flexible model. */
export function LearningCurve() {
  const [deg, setDeg] = useState(1);
  const curves = useMemo(() => {
    const r = rng(545);
    return NS.map((n): [number, number] => {
      let tr = 0, va = 0;
      for (let rep = 0; rep < 20; rep++) {
        const xs = Array.from({ length: n }, () => 2 * r() - 1), ys = xs.map((x) => f(x) + 0.3 * gauss(r));
        const w = polyFit(xs, ys, deg);
        tr += xs.reduce((s, x, i) => s + (ys[i] - polyEval(w, x)) ** 2, 0) / n;
        for (let k = 0; k < 50; k++) { const x = 2 * r() - 1; va += (f(x) + 0.3 * gauss(r) - polyEval(w, x)) ** 2 / 50; }
      }
      return [tr / 20, Math.min(va / 20, 2)];
    });
  }, [deg]);
  const sx = (n: number): number => 30 + (Math.log(n / 8) / Math.log(32)) * 290, sy = (e: number): number => 150 - (Math.min(e, 0.6) / 0.6) * 130;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 175" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Learning curves">
        <line x1="30" x2="320" y1={sy(0.09)} y2={sy(0.09)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x="318" y={sy(0.09) - 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">noise floor</text>
        <polyline points={curves.map((c, i) => `${sx(NS[i])},${sy(c[0])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={curves.map((c, i) => `${sx(NS[i])},${sy(c[1])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        {[8, 32, 128, 256].map((n) => <text key={n} x={sx(n)} y="168" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{n}</text>)}
        <text x="34" y="14" fontSize="8" fill="var(--ai)">training error</text>
        <text x="100" y="14" fontSize="8" fill="var(--neuro)">validation error</text>
      </svg>
      <Slider label="polynomial degree" value={deg} min={0} max={9} step={1} onChange={setDeg} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="validation error at n = 16" value={curves[2][1].toFixed(3)} />
        <Stat label="validation error at n = 256" value={curves[10][1].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">A simple model's curves meet quickly, at an error well above the noise floor: more data will not help, a richer model will. A flexible model starts with a wide gap between the curves that closes slowly: more data helps a lot.</p>
    </div>
  );
}
