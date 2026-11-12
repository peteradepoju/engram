"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Minimum-jerk profiles (position, velocity, acceleration) for a reach of chosen distance and duration. */
export function MinimumJerk() {
  const [D, setD] = useState(30);
  const [T, setT] = useState(0.6);
  const n = 101, ts = Array.from({ length: n }, (_, i) => (i / (n - 1)) * T);
  const pos = ts.map((t) => { const u = t / T; return D * (10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5); });
  const vel = ts.map((t) => { const u = t / T; return (D / T) * (30 * u ** 2 - 60 * u ** 3 + 30 * u ** 4); });
  const acc = ts.map((t) => { const u = t / T; return (D / (T * T)) * (60 * u - 180 * u ** 2 + 120 * u ** 3); });
  const W = 360, panel = (y0: number, arr: number[], lo: number, hi: number, col: string, label: string) => (
    <g>
      <text x="12" y={y0 - 44} fontSize="9" fill="var(--ink-3)">{label}</text>
      <line x1="12" x2="348" y1={y0 - ((0 - lo) / (hi - lo)) * 40} y2={y0 - ((0 - lo) / (hi - lo)) * 40} stroke="var(--line)" />
      <polyline points={arr.map((v, i) => `${12 + (i / (n - 1)) * 336},${y0 - ((v - lo) / (hi - lo || 1)) * 40}`).join(" ")} fill="none" stroke={col} strokeWidth="2" />
    </g>
  );
  const amax = Math.max(...acc.map(Math.abs));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 200`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Minimum-jerk position, velocity and acceleration">
        {panel(62, pos, 0, D, "var(--ink)", "position")}
        {panel(126, vel, 0, Math.max(...vel), "var(--ai)", "velocity")}
        {panel(192, acc, -amax, amax, "var(--neuro)", "acceleration")}
      </svg>
      <Slider label="distance" value={D} min={5} max={60} step={1} onChange={setD} unit="cm" />
      <Slider label="duration" value={T} min={0.2} max={1.5} step={0.05} onChange={setT} unit="s" fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="peak speed" value={`${(1.875 * D / T).toFixed(0)} cm/s`} />
        <Stat label="average speed" value={`${(D / T).toFixed(0)} cm/s`} />
        <Stat label="peak acceleration" value={`${(amax / 100).toFixed(1)} m/s²`} />
      </div>
      <p className="text-sm text-ink-2">Change the distance or duration and the shapes do not change, only their scales: every minimum-jerk reach is the same curve stretched. Peak speed is always 1.875 times the average, at the midpoint. Halving the duration doubles the peak speed and quadruples the peak acceleration, which is why fast movements demand much larger forces.</p>
    </div>
  );
}
