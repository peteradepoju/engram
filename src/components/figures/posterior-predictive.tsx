"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Stay probabilities in data versus plain and perseverative learning models (simulated). */
export function PosteriorPredictive() {
  const [kappa, setKappa] = useState(1.5);
  const res = useMemo(() => {
    const T = 2000;
    const sim = (alpha: number, beta: number, k: number, seed: number) => {
      const r = rng(seed); const Q = [0, 0]; let prev = -1; let sw = 0, nw = 0, sl = 0, nl = 0, lastA = -1, lastR = 0;
      for (let t = 0; t < T; t++) {
        const mu = Math.floor(t / 100) % 2 === 0 ? [0.3, 0.7] : [0.7, 0.3];
        const u = [beta * Q[0] + (prev === 0 ? k : 0), beta * Q[1] + (prev === 1 ? k : 0)];
        const a = r() < 1 / (1 + Math.exp(-(u[1] - u[0]))) ? 1 : 0, rw = r() < mu[a] ? 1 : 0;
        if (lastA >= 0) { if (lastR) { nw++; if (a === lastA) sw++; } else { nl++; if (a === lastA) sl++; } }
        Q[a] += alpha * (rw - Q[a]); prev = a; lastA = a; lastR = rw;
      }
      return [sw / nw, sl / nl];
    };
    const data = sim(0.3, 3, kappa, 1);
    const plain = sim(0.25, 3 + 1.4 * kappa, 0, 2);
    const sticky = sim(0.3, 3, kappa, 3);
    return { data, plain, sticky };
  }, [kappa]);
  const groups: [string, number[], string][] = [["data", res.data, "var(--ink)"], ["plain fit", res.plain, "var(--neuro)"], ["perseveration fit", res.sticky, "var(--ai)"]];
  const sy = (v: number) => 150 - ((v - 0.4) / 0.6) * 130;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 175" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Posterior predictive check">
        {["after win", "after loss"].map((lab, j) => (
          <g key={lab}>
            {groups.map(([nm, v, col], i) => <rect key={nm} x={50 + j * 160 + i * 34} y={sy(v[j])} width="30" height={150 - sy(v[j])} fill={col} opacity="0.85" />)}
            <text x={50 + j * 160 + 50} y="166" fontSize="9" textAnchor="middle" fill="var(--ink-2)">{lab}</text>
          </g>
        ))}
        <line x1="40" x2="350" y1="150" y2="150" stroke="var(--line)" />
        {groups.map(([nm, , col], i) => <text key={nm} x={50 + i * 90} y="14" fontSize="8" fill={col}>{nm}</text>)}
      </svg>
      <Slider label="participant's perseveration κ" value={kappa} min={0} max={3} step={0.1} onChange={setKappa} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="stay after loss, data" value={res.data[1].toFixed(2)} />
        <Stat label="stay after loss, plain fit" value={res.plain[1].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">A schematic of the lesson: the plain model is simulated with an inflated inverse temperature, as its fit produces. With no perseveration the two models agree; as κ grows, the plain model increasingly fails to stay after losses.</p>
    </div>
  );
}
