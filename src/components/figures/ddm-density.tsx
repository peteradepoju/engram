"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** First-passage time densities of the Wiener diffusion model at the two bounds. */
export function DDMDensity() {
  const [v, setV] = useState(1.2);
  const [a, setA] = useState(1.5);
  const [w, setW] = useState(0.5);
  const fpt = (t: number, vv: number, ww: number) => { let s = 0; const u = t / (a * a); for (let k = 1; k <= 60; k++) s += k * Math.exp((-k * k * Math.PI * Math.PI * u) / 2) * Math.sin(k * Math.PI * ww); return (Math.exp(-vv * a * ww - (vv * vv * t) / 2) / (a * a)) * Math.PI * s; };
  const { ts, up, lo, pUp } = useMemo(() => {
    const ts = Array.from({ length: 300 }, (_, i) => 0.005 + i * 0.01);
    const up = ts.map((t) => Math.max(0, fpt(t, -v, 1 - w))), lo = ts.map((t) => Math.max(0, fpt(t, v, w)));
    const pUp = up.reduce((s, x) => s + x, 0) * 0.01;
    return { ts, up, lo, pUp };
  }, [v, a, w]);
  const m = Math.max(...up, ...lo, 0.01);
  const sx = (t: number) => 25 + (t / 3) * 320, syU = (d: number) => 85 - (d / m) * 70, syL = (d: number) => 95 + (d / m) * 70;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="First-passage time densities">
        <polyline points={ts.map((t, i) => `${sx(t)},${syU(up[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={ts.map((t, i) => `${sx(t)},${syL(lo[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <line x1="25" x2="345" y1="90" y2="90" stroke="var(--line)" />
        <text x="30" y="14" fontSize="8" fill="var(--ai)">upper bound (correct)</text>
        <text x="30" y="176" fontSize="8" fill="var(--neuro)">lower bound (error)</text>
        <text x="345" y="100" fontSize="8" textAnchor="end" fill="var(--ink-3)">3 s</text>
      </svg>
      <Slider label="drift v" value={v} min={-2} max={3} step={0.05} onChange={setV} fmt={(x) => x.toFixed(2)} />
      <Slider label="boundary separation a" value={a} min={0.5} max={3} step={0.05} onChange={setA} fmt={(x) => x.toFixed(2)} />
      <Slider label="relative starting point w" value={w} min={0.1} max={0.9} step={0.01} onChange={setW} fmt={(x) => x.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="P(upper bound)" value={pUp.toFixed(3)} />
        <Stat label="P(lower bound)" value={(1 - pUp).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The upper density is drawn above the axis and the lower below it. Their areas are the choice probabilities. Moving the starting point towards a bound makes that bound&apos;s responses both more likely and faster.</p>
    </div>
  );
}
