"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The reduced Wong-Wang model: trajectories of the two population rates for a few trials. */
export function WangAttractor() {
  const [coh, setCoh] = useState(6.4);
  const [dur, setDur] = useState(0.6);
  const trials = useMemo(() => {
    const r = rng(2002), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const H = (x: number) => (270 * x - 108) / (1 - Math.exp(-0.154 * (270 * x - 108)));
    const dt = 0.001, T = 1.5, out: { r1: number[]; r2: number[] }[] = [];
    for (let n = 0; n < 16; n++) {
      let S1 = 0.1, S2 = 0.1, N1 = 0, N2 = 0, a1 = 0, a2 = 0; const r1s: number[] = [], r2s: number[] = [];
      for (let k = 0; k < T / dt; k++) {
        const on = k * dt < dur ? 1 : 0;
        const I1 = 5.2e-4 * 30 * (1 + coh / 100) * on, I2 = 5.2e-4 * 30 * (1 - coh / 100) * on;
        const r1 = H(0.2609 * S1 - 0.0497 * S2 + 0.3255 + I1 + N1), r2 = H(0.2609 * S2 - 0.0497 * S1 + 0.3255 + I2 + N2);
        S1 += dt * (-S1 / 0.1 + (1 - S1) * 0.641 * r1); S2 += dt * (-S2 / 0.1 + (1 - S2) * 0.641 * r2);
        N1 += -N1 * dt / 0.002 + Math.sqrt(dt / 0.002) * 0.02 * g(); N2 += -N2 * dt / 0.002 + Math.sqrt(dt / 0.002) * 0.02 * g();
        a1 += r1 / 20; a2 += r2 / 20;
        if (k % 20 === 19) { r1s.push(a1); r2s.push(a2); a1 = 0; a2 = 0; }
      }
      out.push({ r1: r1s, r2: r2s });
    }
    return out;
  }, [coh, dur]);
  const W = 360, H = 190, sx = (v: number) => 30 + Math.min(v, 40) / 40 * 300, sy = (v: number) => H - 20 - Math.min(v, 40) / 40 * (H - 35);
  const wins = trials.filter((t) => t.r1[t.r1.length - 1] > t.r2[t.r2.length - 1]).length;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Population rate trajectories">
        <line x1="30" x2="330" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <line x1="30" x2="30" y1={sy(40)} y2={sy(0)} stroke="var(--line)" />
        <line x1={sx(15)} x2={sx(15)} y1={sy(40)} y2={sy(0)} stroke="var(--ink-3)" strokeDasharray="2 3" />
        <line x1={sx(0)} x2={sx(40)} y1={sy(15)} y2={sy(15)} stroke="var(--ink-3)" strokeDasharray="2 3" />
        {trials.map((t, i) => (
          <polyline key={i} points={t.r1.map((v, k) => `${sx(v)},${sy(t.r2[k])}`).join(" ")} fill="none" stroke={t.r1[t.r1.length - 1] > t.r2[t.r2.length - 1] ? "var(--ai)" : "var(--neuro)"} strokeWidth="1" opacity="0.8" />
        ))}
        <text x="330" y={H - 6} fontSize="8" textAnchor="end" fill="var(--ink-3)">rate of population 1 (Hz)</text>
        <text x="34" y="16" fontSize="8" fill="var(--ink-3)">rate of population 2 (Hz)</text>
        <text x={sx(15) + 3} y={sy(38)} fontSize="7" fill="var(--ink-3)">threshold</text>
      </svg>
      <Slider label="coherence towards choice 1" value={coh} min={0} max={51.2} step={0.8} onChange={setCoh} unit="%" />
      <Slider label="stimulus duration" value={dur} min={0.1} max={1.5} step={0.05} onChange={setDur} unit="s" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="trials ending in choice 1" value={`${wins} of ${trials.length}`} />
        <Stat label="trials ending in choice 2" value={`${trials.length - wins} of ${trials.length}`} />
      </div>
      <p className="text-sm text-ink-2">Each line is one trial, traced in the plane of the two population rates from the spontaneous state near the origin. Trials leave along the diagonal, then bend towards one of the two decision states, where one population is high and the other silent. Shorten the stimulus and some trials fail to leave the spontaneous state.</p>
    </div>
  );
}
