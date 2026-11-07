"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A one-dimensional flow: a population with recurrent excitation, τ dr/dt = −r + F(w r + I). Fixed points and their stability. */
export function Flow1D() {
  const [w, setW] = useState(8);
  const [I, setI] = useState(0);
  const F = (u: number) => 1 / (1 + Math.exp(-(u - 4)));
  const f = (r: number) => -r + F(w * r + I);
  const lo = -0.1, hi = 1.1, n = 400;
  const rs = Array.from({ length: n + 1 }, (_, i) => lo + ((hi - lo) * i) / n);
  const fps: { r: number; stable: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    let a = rs[i], b = rs[i + 1];
    if (f(a) === 0 || f(a) * f(b) < 0) {
      for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
      const r = (a + b) / 2, d = (f(r + 1e-5) - f(r - 1e-5)) / 2e-5;
      fps.push({ r, stable: d < 0 });
    }
  }
  const W = 360, H = 210, X = (r: number) => 30 + ((r - lo) / (hi - lo)) * (W - 40);
  const top = 0.25, Y = (v: number) => H / 2 - 8 - (v / top) * (H / 2 - 24);
  const arrows = Array.from({ length: 11 }, (_, i) => lo + 0.05 + i * 0.1).map((r) => {
    const v = f(r); if (Math.abs(v) < 0.01) return null;
    const dir = v > 0 ? 1 : -1, x = X(r), y = Y(0);
    return <path key={r} d={`M${x - 5 * dir},${y - 4} L${x + 5 * dir},${y} L${x - 5 * dir},${y + 4}`} fill="none" stroke="var(--ai)" strokeWidth="1.8" />;
  });
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="The rate of change against the rate, with fixed points marked">
        <line x1="30" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <line x1={X(0)} x2={X(0)} y1="10" y2={H - 26} stroke="var(--line)" />
        <polyline points={rs.map((r) => `${X(r)},${Y(Math.max(-top, Math.min(top, f(r))))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        {arrows}
        {fps.map((p, i) => <circle key={i} cx={X(p.r)} cy={Y(0)} r="6" fill={p.stable ? "var(--ink)" : "var(--surface-2)"} stroke="var(--ink)" strokeWidth="2" />)}
        {[0, 0.5, 1].map((r) => <text key={r} x={X(r)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{r}</text>)}
        <text x={W - 12} y={H - 10} fontSize="10" textAnchor="end" fill="var(--ink-3)">rate r</text>
        <text x={X(0) + 4} y="20" fontSize="10" fill="var(--neuro)">τ dr/dt</text>
        <text x="34" y={H - 32} fontSize="9" fill="var(--ink-3)">filled: stable · open: unstable</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="recurrent weight w" value={w} min={0} max={12} step={0.1} onChange={setW} />
        <Slider label="external input I" value={I} min={-3} max={3} step={0.05} onChange={setI} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fixed points" value={`${fps.length}`} />
        <Stat label="stable states" value={fps.filter((p) => p.stable).map((p) => p.r.toFixed(2)).join(", ") || "none"} />
      </div>
      <p className="text-sm text-ink-2">For one variable, the whole dynamics is in this curve. Where it lies above zero the rate grows, where below it shrinks, so the arrows on the axis show the flow. Fixed points are where the curve crosses zero: stable if it crosses going down, unstable if going up. With strong recurrent excitation the population has two stable states, low and high, separated by an unstable one: a memory. Push the input and one state disappears.</p>
    </div>
  );
}
