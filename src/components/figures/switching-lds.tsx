"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const T = 200;

/** Behaviour as a sequence of discrete states, each with its own linear dynamics. */
export function SwitchingLds() {
  const [stay, setStay] = useState(0.97);
  const res = useMemo(() => {
    const r = rng(655);
    const regimes = [
      { name: "still", a: 0.6, drift: 0, q: 0.05 },
      { name: "run", a: 0.95, drift: 0.25, q: 0.05 },
      { name: "turn", a: 0.8, drift: -0.2, q: 0.3 },
    ];
    const s: number[] = [0], v: number[] = [0];
    for (let t = 1; t < T; t++) {
      s.push(r() < stay ? s[t - 1] : Math.floor(r() * 3));
      const g = regimes[s[t]];
      v.push(g.a * v[t - 1] + g.drift + Math.sqrt(g.q) * gauss(r));
    }
    const dwell = (() => { let n = 1; for (let t = 1; t < T; t++) if (s[t] !== s[t - 1]) n++; return T / n; })();
    return { s, v, dwell, regimes };
  }, [stay]);
  const sx = (t: number): number => 15 + t * 1.6, sy = (x: number): number => 85 - x * 12;
  const COLS = ["var(--ink-3)", "var(--neuro)", "var(--warn)"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Switching dynamics">
        {res.s.map((k, t) => <rect key={t} x={sx(t)} y="112" width="1.8" height="10" fill={COLS[k]} />)}
        <polyline points={res.v.map((x, t) => `${sx(t)},${Math.max(5, Math.min(105, sy(x)))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" />
        {res.regimes.map((g, k) => <text key={k} x={20 + k * 95} y="140" fontSize="9" fill={COLS[k]}>{g.name}</text>)}
        <text x="18" y="12" fontSize="8" fill="var(--ink-3)">continuous state (for example, speed)</text>
      </svg>
      <Slider label="probability of staying in a state" value={stay} min={0.8} max={0.995} step={0.005} onChange={setStay} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean dwell time (steps)" value={res.dwell.toFixed(0)} />
        <Stat label="states" value="3" />
      </div>
      <p className="text-sm text-ink-2">A switching linear dynamical system has a discrete state that persists and chooses which linear dynamics govern the continuous state. Each regime has its own decay, drift and noise, so one model can describe behaviour made of repeated motifs: standing still, running, turning. Inference must then estimate both the switch times and the continuous trajectory.</p>
    </div>
  );
}
