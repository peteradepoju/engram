"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Many random walkers: each step ±1 (plus a drift). Their spread grows like √t; the histogram at the chosen time matches a Gaussian. */
export function RandomWalkSpread() {
  const [T, setT] = useState(100);
  const [drift, setDrift] = useState(0);
  const n = 400, Tmax = 200;
  const walks = useMemo(() => {
    const r = rng(1964);
    return Array.from({ length: n }, () => { let x = 0; const p = [0]; for (let t = 0; t < Tmax; t++) { x += (r() < 0.5 + drift / 2 ? 1 : -1); p.push(x); } return p; });
  }, [drift]);
  const W = 360, H = 200, pw = 250, X = (t: number) => 26 + (t / Tmax) * (pw - 30), Y = (x: number) => H / 2 - x * 1.6;
  const ends = walks.map((p) => p[T]);
  const mean = ends.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(ends.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  const bins = new Map<number, number>(); ends.forEach((e) => { const k = Math.round(e / 4) * 4; bins.set(k, (bins.get(k) ?? 0) + 1); });
  const theoryMean = drift * T, theorySd = Math.sqrt(T * (1 - drift * drift));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Random walk paths and the distribution of positions">
        <line x1="26" x2={pw - 4} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        {walks.slice(0, 25).map((p, i) => <polyline key={i} points={p.map((x, t) => `${X(t)},${Y(x)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="0.8" opacity="0.5" />)}
        <polyline points={Array.from({ length: Tmax + 1 }, (_, t) => `${X(t)},${Y(drift * t + 2 * Math.sqrt(t * (1 - drift * drift)))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="4 3" />
        <polyline points={Array.from({ length: Tmax + 1 }, (_, t) => `${X(t)},${Y(drift * t - 2 * Math.sqrt(t * (1 - drift * drift)))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={X(T)} x2={X(T)} y1="8" y2={H - 8} stroke="var(--warn)" />
        {[...bins.entries()].map(([k, c]) => <rect key={k} x={pw + 4} y={Y(k + 2)} width={(c / n) * 400} height={Math.max(1, Y(k - 2) - Y(k + 2) - 0.5)} fill="var(--neuro)" opacity="0.7" />)}
        <polyline points={Array.from({ length: 81 }, (_, i) => { const x = theoryMean - 4 * theorySd + (i / 80) * 8 * theorySd; const d = Math.exp(-((x - theoryMean) ** 2) / (2 * theorySd ** 2)) / (theorySd * Math.sqrt(2 * Math.PI)); return `${pw + 4 + d * 4 * 400},${Y(x)}`; }).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" />
        <text x="30" y="16" fontSize="9" fill="var(--ai)">dashed: mean ± 2√t</text>
        <text x={pw + 4} y="16" fontSize="9" fill="var(--ink-3)">at time t</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="time t (steps)" value={T} min={1} max={Tmax} step={1} onChange={setT} />
        <Slider label="drift (bias of each step)" value={drift} min={-0.3} max={0.3} step={0.01} onChange={setDrift} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="spread of 400 walkers" value={sd.toFixed(2)} />
        <Stat label="theory √(t(1 − drift²))" value={theorySd.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Each walker steps up or down by 1 at random. No single path is predictable, but the crowd is: its spread grows like the square root of time, and the distribution of positions approaches a Gaussian (the central limit theorem). A small bias in each step adds a drift that grows like t, so in the long run drift always beats diffusion.</p>
    </div>
  );
}
