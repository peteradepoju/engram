"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** The two-rate model of motor adaptation (Smith, Ghazizadeh and Shadmehr, 2006) through adaptation, de-adaptation to zero output and an error clamp. */
export function TwoRateAdaptation() {
  const [Af, setAf] = useState(0.59);
  const [Bf, setBf] = useState(0.21);
  const [As, setAs] = useState(0.992);
  const [Bs, setBs] = useState(0.02);
  const sim = useMemo(() => {
    let xf = 0, xs = 0, phase = "adapt", clampAt = -1;
    const fast: number[] = [], slow: number[] = [], net: number[] = [];
    for (let n = 0; n < 400; n++) {
      const x = xf + xs; fast.push(xf); slow.push(xs); net.push(x);
      if (phase === "adapt" && n === 200) phase = "deadapt";
      if (phase === "deadapt" && x <= 0) { phase = "clamp"; clampAt = n; }
      if (phase === "deadapt" && n > 350) { phase = "clamp"; clampAt = n; }
      const e = phase === "clamp" ? 0 : (phase === "adapt" ? 1 : -1) - x;
      xf = Af * xf + Bf * e; xs = As * xs + Bs * e;
      if (clampAt >= 0 && n >= clampAt + 120) break;
    }
    return { fast, slow, net, clampAt };
  }, [Af, Bf, As, Bs]);
  const n = sim.net.length, W = 360, H = 200, sx = (i: number) => 12 + (i / (n - 1)) * 336, sy = (v: number) => 100 - v * 80;
  const line = (a: number[]) => a.map((v, i) => `${sx(i)},${sy(Math.max(-1.2, Math.min(1.2, v)))}`).join(" ");
  const rebound = sim.clampAt >= 0 ? Math.max(...sim.net.slice(sim.clampAt)) : 0;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Fast, slow and net adaptation over trials">
        <line x1="12" x2="348" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {sim.clampAt >= 0 && <rect x={sx(sim.clampAt)} y="12" width={348 - sx(sim.clampAt)} height={H - 24} fill="var(--surface)" opacity="0.5" />}
        <polyline points={line(sim.fast)} fill="none" stroke="var(--neuro)" strokeWidth="1.3" />
        <polyline points={line(sim.slow)} fill="none" stroke="var(--good)" strokeWidth="1.3" />
        <polyline points={line(sim.net)} fill="none" stroke="var(--ink)" strokeWidth="2" />
        <text x="14" y="190" fontSize="9" fill="var(--ink)">net</text>
        <text x="40" y="190" fontSize="9" fill="var(--neuro)">fast</text>
        <text x="66" y="190" fontSize="9" fill="var(--good)">slow</text>
        {sim.clampAt >= 0 && <text x={sx(sim.clampAt) + 4} y="24" fontSize="9" fill="var(--ink-3)">error clamp</text>}
      </svg>
      <Slider label="fast retention A_f" value={Af} min={0.3} max={0.95} step={0.01} onChange={setAf} fmt={(v) => v.toFixed(2)} />
      <Slider label="fast learning rate B_f" value={Bf} min={0.05} max={0.5} step={0.01} onChange={setBf} fmt={(v) => v.toFixed(2)} />
      <Slider label="slow retention A_s" value={As} min={0.95} max={0.999} step={0.001} onChange={setAs} fmt={(v) => v.toFixed(3)} />
      <Slider label="slow learning rate B_s" value={Bs} min={0.005} max={0.1} step={0.005} onChange={setBs} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="de-adaptation trials" value={sim.clampAt >= 0 ? `${sim.clampAt - 200}` : "none"} />
        <Stat label="peak rebound in clamp" value={rebound.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Two hundred trials in the field, then the opposite field until the net output first reaches zero, then error clamps (shaded). During de-adaptation the fast state plunges below zero while the slow state barely moves; in the clamp the fast state decays and the net output rebounds towards the slow state. Make the two processes alike and the rebound disappears, as for a single learner.</p>
    </div>
  );
}
