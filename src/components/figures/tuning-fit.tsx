"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

const ORI = Array.from({ length: 8 }, (_, i) => i * 22.5);
const vm = (th: number, b: number, A: number, tp: number, k: number) => b + A * Math.exp(k * (Math.cos((2 * Math.PI * (th - tp)) / 180) - 1));

function fit(y: number[]) {
  let best = { err: Infinity, b: 0, A: 0, tp: 0, k: 1 };
  for (let tp = 0; tp < 180; tp += 2) for (let k = 0.25; k <= 6; k += 0.25) {
    const g = ORI.map((o) => Math.exp(k * (Math.cos((2 * Math.PI * (o - tp)) / 180) - 1)));
    const n = 8, sg = g.reduce((a, b) => a + b, 0), sgg = g.reduce((a, b) => a + b * b, 0), sy = y.reduce((a, b) => a + b, 0), sgy = g.reduce((a, b, i) => a + b * y[i], 0);
    const A = (n * sgy - sg * sy) / (n * sgg - sg * sg), b = (sy - A * sg) / n;
    const err = g.reduce((a, gi, i) => a + (b + A * gi - y[i]) ** 2, 0);
    if (err < best.err) best = { err, b, A, tp, k };
  }
  return best;
}

/** Poisson responses of a neuron tuned to 70° (baseline 2, amplitude 18 spikes, κ = 2) at 8 orientations, with a von Mises fit and a 60-sample bootstrap of the preferred orientation. */
export function TuningFit() {
  const [n, setN] = useState(5);
  const { means, sems, f, ci } = useMemo(() => {
    const r = rng(1962 + n);
    const counts = ORI.map((o) => Array.from({ length: n }, () => poisson(vm(o, 2, 18, 70, 2), r)));
    const means = counts.map((c) => c.reduce((a, b) => a + b, 0) / n);
    const sems = counts.map((c, i) => Math.sqrt(c.reduce((a, b) => a + (b - means[i]) ** 2, 0) / Math.max(n - 1, 1) / n));
    const f = fit(means);
    const boots = Array.from({ length: 60 }, () => fit(counts.map((c) => { let s = 0; for (let j = 0; j < n; j++) s += c[Math.floor(r() * n)]; return s / n; })).tp).sort((a, b) => a - b);
    return { means, sems, f, ci: [boots[1], boots[58]] };
  }, [n]);
  const W = 360, H = 200, x0 = 30, x1 = 350, y0 = 12, y1 = 180;
  const X = (o: number) => x0 + (o / 180) * (x1 - x0);
  const Y = (v: number) => y1 - (v / 28) * (y1 - y0);
  const curve = Array.from({ length: 91 }, (_, i) => i * 2).map((o) => `${X(o)},${Y(vm(o, f.b, f.A, f.tp, f.k))}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Tuning curve data with a fitted curve and a confidence band on the preferred orientation">
        <rect x={X(ci[0])} y={y0} width={Math.max(2, X(ci[1]) - X(ci[0]))} height={y1 - y0} fill="var(--ai)" opacity="0.15" />
        <line x1={X(70)} x2={X(70)} y1={y0} y2={y1} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={X(70) + 3} y={y0 + 10} fontSize="9" fill="var(--ink-3)">true preference</text>
        <polyline points={curve} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {ORI.map((o, i) => (
          <g key={o}>
            <line x1={X(o)} x2={X(o)} y1={Y(means[i] - sems[i])} y2={Y(means[i] + sems[i])} stroke="var(--neuro)" />
            <circle cx={X(o)} cy={Y(means[i])} r="3.5" fill="var(--neuro)" />
          </g>
        ))}
        {[0, 45, 90, 135].map((o) => <text key={o} x={X(o)} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{o}°</text>)}
      </svg>
      <Slider label="trials per orientation" value={n} min={2} max={30} step={1} onChange={setN} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fitted preference" value={`${f.tp}°`} />
        <Stat label="bootstrap 95% interval" value={`${ci[0]}° to ${ci[1]}°`} />
      </div>
      <p className="text-sm text-ink-2">Dots are mean spike counts with standard errors; the curve is the von Mises fit, and the shaded band the bootstrap interval for the preferred orientation. With two or three trials the band is wide and the fit can wander; by twenty trials it is tight around the true 70°.</p>
    </div>
  );
}
