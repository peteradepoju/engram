"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";
import { gpPosterior, rbf } from "./gp-lib";

const XS = Array.from({ length: 121 }, (_, i): number => -3 + i * 0.05);

/** The log marginal likelihood of a GP as a function of length-scale, split into data fit and complexity. */
export function MarginalLikelihood() {
  const [ell, setEll] = useState(0.8);
  const data = useMemo(() => { const r = rng(644); const X = Array.from({ length: 25 }, () => -2.8 + 5.6 * r()); return { X, y: X.map((x) => Math.sin(1.5 * x) + 0.25 * gauss(r)) }; }, []);
  const ells = Array.from({ length: 60 }, (_, i): number => 0.05 * Math.exp((i / 59) * Math.log(80)));
  const curve = useMemo(() => ells.map((l) => gpPosterior(rbf(l), data.X, data.y, 0.0625, [0]).logml), [data]);
  const post = gpPosterior(rbf(ell), data.X, data.y, 0.0625, XS);
  const lo = Math.max(Math.min(...curve), Math.max(...curve) - 40), hi = Math.max(...curve);
  const sl = (l: number): number => 185 + (Math.log(l / 0.05) / Math.log(80)) * 145, sv = (v: number): number => 140 - ((Math.max(v, lo) - lo) / (hi - lo)) * 120;
  const sx = (x: number): number => 10 + ((x + 3) / 6) * 160, sy = (y: number): number => 80 - y * 30;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Marginal likelihood against length-scale">
        <polyline points={XS.map((x, i) => `${sx(x)},${Math.max(4, Math.min(156, sy(post.mean[i])))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {data.X.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(data.y[i])} r="2.4" fill="var(--neuro)" />)}
        <polyline points={ells.map((l, i) => `${sl(l)},${sv(curve[i])}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.6" />
        <circle cx={sl(ell)} cy={sv(post.logml)} r="4" fill="var(--warn)" />
        <text x="257" y="155" fontSize="8" textAnchor="middle" fill="var(--ink-3)">length-scale (log axis)</text>
        <text x="257" y="12" fontSize="8" textAnchor="middle" fill="var(--ink-3)">log marginal likelihood</text>
      </svg>
      <Slider label="length-scale" value={ell} min={0.05} max={4} step={0.01} onChange={setEll} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="data fit" value={post.fit.toFixed(1)} />
        <Stat label="complexity penalty" value={post.complexity.toFixed(1)} />
        <Stat label="log marginal likelihood" value={post.logml.toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">A short length-scale lets the GP wiggle through every point, so the data fit is good but the complexity penalty, a log determinant, is large. A long one is simple but misses the data. The marginal likelihood balances the two automatically and peaks near the length-scale that generated the data, with no validation set.</p>
    </div>
  );
}
