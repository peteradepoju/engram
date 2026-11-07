"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";
import { solve } from "./linalg";

/** Fit polynomials of a chosen degree to many small noisy datasets: low degree is biased, high degree is variable. */
export function BiasVariance() {
  const [deg, setDeg] = useState(3);
  const truth = (x: number) => Math.sin(2.5 * x) + 0.3 * x;
  const xs = Array.from({ length: 81 }, (_, i) => -1.5 + (i / 80) * 3);
  const fits = useMemo(() => {
    const r = rng(2019), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 30 }, () => {
      const x = Array.from({ length: 15 }, () => -1.5 + 3 * r());
      const y = x.map((v) => truth(v) + 0.4 * g());
      const Phi = x.map((v) => Array.from({ length: deg + 1 }, (_, j) => (v / 1.5) ** j));
      const XtX = Array.from({ length: deg + 1 }, (_, a) => Array.from({ length: deg + 1 }, (_, b) => Phi.reduce((s, row) => s + row[a] * row[b], 0) + (a === b ? 1e-6 : 0)));
      const Xty = Array.from({ length: deg + 1 }, (_, a) => Phi.reduce((s, row, i) => s + row[a] * y[i], 0));
      const w = solve(XtX, Xty);
      return xs.map((v) => w.reduce((s, c, j) => s + c * (v / 1.5) ** j, 0));
    });
  }, [deg]); // eslint-disable-line react-hooks/exhaustive-deps
  const mean = xs.map((_, i) => fits.reduce((s, f) => s + f[i], 0) / fits.length);
  const bias2 = xs.reduce((s, v, i) => s + (mean[i] - truth(v)) ** 2, 0) / xs.length;
  const variance = xs.reduce((s, _, i) => s + fits.reduce((a, f) => a + (f[i] - mean[i]) ** 2, 0) / fits.length, 0) / xs.length;
  const W = 360, H = 220, X = (v: number) => 14 + ((v + 1.5) / 3) * (W - 28), Y = (v: number) => H / 2 - v * 45;
  const line = (ys: number[]) => xs.map((v, i) => `${X(v)},${Math.max(4, Math.min(H - 4, Y(ys[i])))}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="Polynomial fits to many datasets">
        {fits.map((f, k) => <polyline key={k} points={line(f)} fill="none" stroke="var(--ai)" strokeWidth="1" opacity="0.35" />)}
        <polyline points={line(xs.map(truth))} fill="none" stroke="var(--good)" strokeWidth="2.5" />
        <polyline points={line(mean)} fill="none" stroke="var(--neuro)" strokeWidth="2.5" strokeDasharray="6 3" />
        <text x="10" y="16" fontSize="10" fill="var(--good)">truth</text>
        <text x="10" y="29" fontSize="10" fill="var(--ai)">fits to 30 datasets of 15 points</text>
        <text x="10" y="42" fontSize="10" fill="var(--neuro)">average fit</text>
      </svg>
      <Slider label="polynomial degree" value={deg} min={0} max={10} step={1} onChange={setDeg} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="bias²" value={bias2.toFixed(3)} />
        <Stat label="variance" value={variance > 99 ? "> 99" : variance.toFixed(3)} />
        <Stat label="bias² + variance" value={bias2 + variance > 99 ? "> 99" : (bias2 + variance).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each thin line is a polynomial fitted to a different small, noisy dataset from the same curve. A low degree cannot bend enough: the average fit misses the truth (bias). A high degree bends to every noise point: the fits disagree wildly with each other (variance). The expected test error is bias² plus variance plus the noise, and it is smallest at an intermediate degree.</p>
    </div>
  );
}
