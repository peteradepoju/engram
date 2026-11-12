"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const CONS = [-1, -0.25, -0.125, -0.0625, 0, 0.0625, 0.125, 0.25, 1];

function phi(x: number) { // cumulative Gaussian via erf approximation (Abramowitz and Stegun 7.1.26)
  const z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.3275911 * z);
  const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
  return 0.5 * (1 + (x >= 0 ? e : -e));
}

/** A four-parameter psychometric function and simulated choice proportions at the IBL contrasts. */
export function PsychometricLapses() {
  const [mu, setMu] = useState(0);
  const [sig, setSig] = useState(0.12);
  const [lapse, setLapse] = useState(0.08);
  const [seed, setSeed] = useState(1);
  const p = (c: number) => lapse + (1 - 2 * lapse) * phi((c - mu) / sig);
  const data = useMemo(() => {
    const r = rng(seed * 101 + 7), q = (c: number) => lapse + (1 - 2 * lapse) * phi((c - mu) / sig);
    return CONS.map((c) => { let k = 0; for (let i = 0; i < 60; i++) if (r() < q(c)) k++; return k / 60; });
  }, [mu, sig, lapse, seed]);
  const W = 360, H = 220, sx = (c: number) => 30 + ((c + 1) / 2) * 310, sy = (v: number) => H - 25 - v * (H - 45);
  const curve = Array.from({ length: 201 }, (_, i) => { const c = -1 + i / 100; return `${sx(c)},${sy(p(c))}`; }).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Psychometric curve with simulated data">
        <line x1="30" x2="340" y1={sy(0.5)} y2={sy(0.5)} stroke="var(--line)" strokeDasharray="3 3" />
        <line x1={sx(0)} x2={sx(0)} y1="15" y2={H - 25} stroke="var(--line)" strokeDasharray="3 3" />
        <polyline points={curve} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {CONS.map((c, i) => <circle key={c} cx={sx(c)} cy={sy(data[i])} r="3.5" fill="var(--ink)" />)}
        <text x="30" y={H - 8} fontSize="9" fill="var(--ink-3)">-100%</text>
        <text x={sx(0)} y={H - 8} fontSize="9" textAnchor="middle" fill="var(--ink-3)">0</text>
        <text x="340" y={H - 8} fontSize="9" textAnchor="end" fill="var(--ink-3)">+100% (right)</text>
        <text x="34" y="14" fontSize="9" fill="var(--ink-3)">P(right)</text>
      </svg>
      <Slider label="bias μ" value={mu} min={-0.3} max={0.3} step={0.01} onChange={setMu} fmt={(v) => v.toFixed(2)} />
      <Slider label="threshold σ" value={sig} min={0.02} max={0.5} step={0.01} onChange={setSig} fmt={(v) => v.toFixed(2)} />
      <Slider label="lapse rate (each side)" value={lapse} min={0} max={0.25} step={0.01} onChange={setLapse} fmt={(v) => v.toFixed(2)} />
      <button className="btn !py-1.5" onClick={() => setSeed((s) => s + 1)}>new sample of 60 trials per contrast</button>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="accuracy at 100% contrast" value={`${Math.round((1 - lapse) * 100)}%`} />
        <Stat label="P(right) at 0%" value={p(0).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The contrasts are those of the IBL task, crowded near zero where the curve changes. Lapses lift the floor and lower the ceiling, so even at full contrast some choices are wrong. Compare a small threshold with large lapses against a large threshold with none: at the extreme contrasts they look alike, and only the points near zero tell them apart.</p>
    </div>
  );
}
