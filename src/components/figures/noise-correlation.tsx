"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Variance of the average of N identically tuned neurons (unit variance each) with pairwise noise correlation ρ, against N on log axes, compared with independent neurons. */
export function NoiseCorrelation() {
  const [rho, setRho] = useState(0.1);
  const [lN, setLN] = useState(2);
  const N = Math.round(10 ** lN);
  const v = (n: number, p: number) => (1 + (n - 1) * p) / n;
  const W = 360, H = 200, x0 = 40, x1 = 350, y0 = 12, y1 = 175;
  const X = (n: number) => x0 + (Math.log10(n) / 3) * (x1 - x0);
  const Y = (val: number) => y0 + (-Math.log10(val) / 3) * (y1 - y0);
  const ns = Array.from({ length: 61 }, (_, i) => 10 ** (i / 20));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Variance of a pooled average against number of neurons">
        {[1, 0.1, 0.01, 0.001].map((val) => <g key={val}><line x1={x0} x2={x1} y1={Y(val)} y2={Y(val)} stroke="var(--line)" /><text x={x0 - 4} y={Y(val) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{val}</text></g>)}
        {[1, 10, 100, 1000].map((n) => <text key={n} x={X(n)} y={H - 6} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{n}</text>)}
        <polyline points={ns.map((n) => `${X(n)},${Y(v(n, 0))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth="1.6" />
        {rho > 0 && <line x1={x0} x2={x1} y1={Y(rho)} y2={Y(rho)} stroke="var(--warn)" strokeDasharray="2 3" />}
        <polyline points={ns.map((n) => `${X(n)},${Y(v(n, rho))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.2" />
        <circle cx={X(N)} cy={Y(v(N, rho))} r="4.5" fill="var(--ai)" />
        <text x={x1} y={y0 + 8} fontSize="9" textAnchor="end" fill="var(--ink-3)">dashed: independent neurons</text>
        {rho > 0 && <text x={x1} y={Y(rho) - 3} fontSize="9" textAnchor="end" fill="var(--warn)">floor ρ</text>}
        <text x={x1} y={H - 18} fontSize="9" textAnchor="end" fill="var(--ink-3)">number of neurons pooled</text>
      </svg>
      <Slider label="pairwise noise correlation ρ" value={rho} min={0} max={0.5} step={0.01} onChange={setRho} fmt={(x) => x.toFixed(2)} />
      <Slider label="neurons pooled" value={lN} min={0} max={3} step={0.05} onChange={setLN} fmt={() => `${N}`} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="variance of the average" value={v(N, rho).toFixed(4)} />
        <Stat label="if independent" value={(1 / N).toFixed(4)} />
      </div>
      <p className="text-sm text-ink-2">Without correlations the noise of an average falls as 1/N forever. With a correlation of only 0.1 it stops falling near 0.1, after about 30 neurons: the shared part of the noise is common to all of them and survives any amount of averaging.</p>
    </div>
  );
}
