"use client";

import { useState, type ReactElement } from "react";
import { useSvgDrag } from "./drag";
import { Slider, Stat } from "./util";

/** The slope field of the membrane equation τ dV/dt = −(V − E) + RI: every solution follows the arrows. Drag the starting voltage. */
export function SlopeField() {
  const [tau, setTau] = useState(20);
  const [RI, setRI] = useState(12);
  const [v0, setV0] = useState(-80);
  const E = -70, Vinf = E + RI, T = 120;
  const W = 360, H = 230, X = (t: number) => 30 + (t / T) * (W - 40), Y = (v: number) => 12 + ((-40 - v) / 50) * (H - 40);
  const Vof = (y: number) => -40 - ((y - 12) / (H - 40)) * 50;
  const drag = useSvgDrag((_, __, y) => setV0(Math.max(-89, Math.min(-41, Vof(y)))));
  const arrows: ReactElement[] = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 9; j++) {
    const t = (i + 0.5) * (T / 12), v = -88 + j * 6;
    const slope = (-(v - E) + RI) / tau;          // mV per ms
    const dt = 4, dv = slope * dt, sx = X(t + dt) - X(t), sy = Y(v + dv) - Y(v), L = Math.hypot(sx, sy), k = 9 / L;
    arrows.push(<line key={`${i}-${j}`} x1={X(t) - sx * k / 2} y1={Y(v) - sy * k / 2} x2={X(t) + sx * k / 2} y2={Y(v) + sy * k / 2} stroke="var(--ink-3)" strokeWidth="1.2" />);
  }
  const sol = Array.from({ length: 241 }, (_, i) => { const t = (i / 240) * T; return `${X(t)},${Y(Vinf + (v0 - Vinf) * Math.exp(-t / tau))}`; }).join(" ");
  return (
    <div className="space-y-3">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="Slope field of the membrane equation with one solution">
        {arrows}
        <line x1="30" x2={W - 10} y1={Y(Vinf)} y2={Y(Vinf)} stroke="var(--good)" strokeDasharray="5 3" />
        <line x1={X(tau)} x2={X(tau)} y1="12" y2={H - 28} stroke="var(--warn)" strokeDasharray="3 3" />
        <polyline points={sol} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <circle cx={X(0)} cy={Y(v0)} r="7" fill="var(--neuro)" {...drag.handle("v0")} />
        {[-90, -80, -70, -60, -50].map((v) => <text key={v} x="26" y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text>)}
        {[0, 40, 80, 120].map((t) => <text key={t} x={X(t)} y={H - 10} fontSize="10" textAnchor={t === 120 ? "end" : t === 0 ? "start" : "middle"} fill="var(--ink-3)">{t} ms</text>)}
        <text x={W - 12} y={Y(Vinf) - 5} fontSize="10" textAnchor="end" fill="var(--good)">V∞ = E + RI</text>
        <text x={X(tau) + 4} y="24" fontSize="10" fill="var(--warn)">t = τ</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="time constant τ" value={tau} min={5} max={60} step={1} onChange={setTau} unit="ms" />
        <Slider label="input RI" value={RI} min={-15} max={28} step={0.5} onChange={setRI} unit="mV" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="start V₀ (drag the dot)" value={`${v0.toFixed(1)} mV`} />
        <Stat label="steady state V∞" value={`${Vinf.toFixed(1)} mV`} />
        <Stat label="V at t = τ" value={`${(Vinf + (v0 - Vinf) * Math.exp(-1)).toFixed(1)} mV`} />
      </div>
      <p className="text-sm text-ink-2">A differential equation gives the slope of the solution at every point: each short line shows which way, and how fast, the voltage changes there. Any solution must follow the lines. For the membrane equation the slopes all point towards the steady state V∞, and the solution approaches it exponentially, closing about 63% of the remaining gap in every time constant τ.</p>
    </div>
  );
}
