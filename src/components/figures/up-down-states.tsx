"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** A population with recurrent excitation and adaptation: up and down states. */
export function UpDownStates() {
  const [b, setB] = useState(2);
  const [I, setI] = useState(1);
  const sim = useMemo(() => {
    const r = rng(1993), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const f = (u: number) => 1 / (1 + Math.exp(-(u - 3) / 0.5));
    const dt = 0.002, tau = 0.01, taua = 0.5, n = 5000;
    let x = 0, a = 0, up = 0, trans = 0, prev = false;
    const X: number[] = [], A: number[] = [];
    for (let k = 0; k < n; k++) {
      x += (dt / tau) * (-x + f(6 * x + I - a)) + 0.15 * Math.sqrt(dt / tau) * g();
      a += (dt / taua) * (-a + b * x);
      const isUp = x > 0.5; if (isUp) up++; if (isUp && !prev) trans++; prev = isUp;
      if (k % 5 === 0) { X.push(x); A.push(a); }
    }
    return { X, A, upFrac: up / n, rate: trans / (n * dt) };
  }, [b, I]);
  const W = 360, H = 150, sx = (i: number) => 20 + (i / sim.X.length) * 330, sy = (v: number) => H - 20 - Math.max(-0.2, Math.min(1.2, v)) * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Up and down states">
        <polyline points={sim.A.map((v, i) => `${sx(i)},${sy(v / 2)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1" opacity="0.7" />
        <polyline points={sim.X.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1" />
        <text x="22" y="14" fontSize="8" fill="var(--neuro)">activity</text>
        <text x="60" y="14" fontSize="8" fill="var(--ai)">adaptation</text>
        <text x="350" y={H - 6} fontSize="8" textAnchor="end" fill="var(--ink-3)">10 s</text>
      </svg>
      <Slider label="adaptation strength b" value={b} min={0} max={3} step={0.1} onChange={setB} fmt={(v) => v.toFixed(1)} />
      <Slider label="drive I (arousal)" value={I} min={0} max={2.5} step={0.05} onChange={setI} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="time in up state" value={`${Math.round(100 * sim.upFrac)}%`} />
        <Stat label="up states per second" value={sim.rate.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With no adaptation, switches are rare and random. With adaptation, up states end on their own and the population cycles below 1 Hz. Raise the drive and down states disappear, as on waking.</p>
    </div>
  );
}
