"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Gradient descent on f = ½(λ₁x² + λ₂y²): each direction shrinks by |1 − ηλ| per step, so η must stay below 2/λmax. The same rule as Euler's method. */
export function TwoOverLambda() {
  const [kappa, setKappa] = useState(10);
  const [eta, setEta] = useState(0.15);
  const lams = [1, kappa], steps = 40;
  const series = lams.map((l) => Array.from({ length: steps + 1 }, (_, k) => Math.abs(1 - eta * l) ** k));
  const W = 360, H = 200, X = (k: number) => 34 + (k / steps) * (W - 44), Y = (v: number) => { const lv = Math.log10(Math.max(v, 1e-8)); return 14 + ((2 - lv) / 10) * (H - 40); };
  const factors = lams.map((l) => Math.abs(1 - eta * l));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Error along two directions during gradient descent">
        {[2, 0, -2, -4, -6, -8].map((e) => <g key={e}><line x1="34" x2={W - 10} y1={Y(10 ** e)} y2={Y(10 ** e)} stroke="var(--line)" /><text x="30" y={Y(10 ** e) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">1e{e}</text></g>)}
        {series.map((sr, i) => <polyline key={i} points={sr.map((v, k) => `${X(k)},${Y(v)}`).join(" ")} fill="none" stroke={i ? "var(--warn)" : "var(--ai)"} strokeWidth="2" />)}
        <text x={W - 12} y="24" fontSize="10" textAnchor="end" fill="var(--ai)">flat direction (λ = 1)</text>
        <text x={W - 12} y="38" fontSize="10" textAnchor="end" fill="var(--warn)">steep direction (λ = {kappa})</text>
        <text x={W - 12} y={H - 8} fontSize="9" textAnchor="end" fill="var(--ink-3)">steps →</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="learning rate η" value={eta} min={0.01} max={0.4} step={0.005} onChange={setEta} fmt={(v) => v.toFixed(3)} />
        <Slider label="condition number λmax/λmin" value={kappa} min={1} max={30} step={1} onChange={setKappa} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="factor, flat" value={factors[0].toFixed(3)} />
        <Stat label="factor, steep" value={factors[1].toFixed(3)} />
        <Stat label="stability limit 2/λmax" value={(2 / kappa).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">On a quadratic bowl, gradient descent multiplies the error along each eigen-direction of the Hessian by 1 − ηλ every step (Week 12). Above η = 2/λmax the steep direction explodes; well below it, the flat direction crawls. The same inequality appeared three times in Part 1: as the learning-rate limit, as Euler's stability limit Δt below 2τ (Week 21), and as the multiplier condition for a map's fixed point (Week 23). They are one fact: a linear step is stable when its factor has size below 1.</p>
    </div>
  );
}
