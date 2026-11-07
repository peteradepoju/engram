"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** The Hopf normal form in polar coordinates, ṙ = μr + s r³ − r⁵, θ̇ = ω. Supercritical (s = −1) or subcritical (s = +1). */
export function HopfCycle() {
  const [mu, setMu] = useState(0.2);
  const [sub, setSub] = useState(false);
  const [r0, setR0] = useState(0.1);
  const s = sub ? 1 : -1, omega = 2;
  const rdot = (r: number) => mu * r + s * r ** 3 - r ** 5;
  let r = r0, th = 0; const pts: string[] = [];
  const W = 360, H = 220, cx = W / 2, cy = H / 2 - 4, sc = 60;
  for (let k = 0; k < 3000; k++) {
    pts.push(`${cx + sc * r * Math.cos(th)},${cy - sc * r * Math.sin(th)}`);
    r = Math.max(0, r + 0.01 * rdot(r)); th += 0.01 * omega;
    if (r > 1.7) break;
  }
  // limit cycles: positive roots of μ + s r² − r⁴ = 0, i.e. r² = (s ± √(1 + 4μ)) / 2
  const disc = 1 + 4 * mu;
  const cycles = disc < 0 ? [] : [(s + Math.sqrt(disc)) / 2, (s - Math.sqrt(disc)) / 2].filter((x) => x > 1e-9).map(Math.sqrt);
  const stableCycle = (rc: number) => mu + 3 * s * rc * rc - 5 * rc ** 4 < 0;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Trajectory near a Hopf bifurcation">
        <line x1="10" x2={W - 10} y1={cy} y2={cy} stroke="var(--line)" />
        <line x1={cx} x2={cx} y1="8" y2={H - 8} stroke="var(--line)" />
        {cycles.map((rc, i) => <circle key={i} cx={cx} cy={cy} r={sc * rc} fill="none" stroke={stableCycle(rc) ? "var(--good)" : "var(--warn)"} strokeWidth="2" strokeDasharray={stableCycle(rc) ? undefined : "5 4"} />)}
        <polyline points={pts.join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="4" fill={mu < 0 ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink)" strokeWidth="2" />
        <text x="14" y="20" fontSize="10" fill="var(--ink-3)">{sub ? "subcritical" : "supercritical"}</text>
        <text x="14" y={H - 10} fontSize="9" fill="var(--good)">solid ring: stable cycle</text>
        <text x={W - 14} y={H - 10} fontSize="9" textAnchor="end" fill="var(--warn)">dashed: unstable cycle</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="parameter μ" value={mu} min={-0.3} max={0.5} step={0.01} onChange={setMu} />
        <Slider label="starting radius" value={r0} min={0.02} max={1.5} step={0.01} onChange={setR0} />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" checked={sub} onChange={(e) => setSub(e.target.checked)} className="accent-[var(--accent)]" />
        subcritical version (the cubic term pushes outwards)
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fixed point at the origin" value={mu < 0 ? "stable" : "unstable"} />
        <Stat label="limit cycle radii" value={cycles.length ? cycles.map((c) => c.toFixed(2)).join(", ") : "none"} />
      </div>
      <p className="text-sm text-ink-2">As μ passes zero, the eigenvalues at the origin, μ ± iω, cross the imaginary axis. In the supercritical case a small stable cycle is born and grows like √μ: oscillations start gently. In the subcritical case an unstable cycle shrinks onto the origin, and the trajectory jumps to a large cycle that already existed: oscillations start suddenly, and for slightly negative μ rest and oscillation coexist. Try a large starting radius there.</p>
    </div>
  );
}
