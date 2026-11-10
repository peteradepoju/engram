"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Voltage response of an isopotential spherical cell to a 20 pA current step, for adjustable diameter and specific membrane resistance (c_m = 1 μF/cm²). */
export function CellSize() {
  const [d, setD] = useState(20);
  const [rm, setRm] = useState(20);
  const A = Math.PI * (d * 1e-4) ** 2;          // cm²
  const C = 1e-6 * A, R = (rm * 1e3) / A, tau = R * C; // F, Ω, s
  const I = 20e-12, dV = I * R * 1e3;           // mV
  const W = 360, H = 200, x0 = 34, x1 = 350, y0 = 16, y1 = 170, T = 0.2;
  const vmax = 100;
  const X = (t: number) => x0 + (t / T) * (x1 - x0);
  const Y = (v: number) => y1 - (Math.min(v, vmax) / vmax) * (y1 - y0);
  const resp = (t: number) => (t < 0.02 ? 0 : t < 0.12 ? dV * (1 - Math.exp(-(t - 0.02) / tau)) : dV * (1 - Math.exp(-0.1 / tau)) * Math.exp(-(t - 0.12) / tau));
  const pts = Array.from({ length: 241 }, (_, i) => (i / 240) * T).map((t) => `${X(t)},${Y(resp(t))}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Voltage response of a spherical cell to a current step">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="var(--line)" />
            <text x={x0 - 4} y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text>
          </g>
        ))}
        <text x={x0 + 2} y={y0 - 4} fontSize="9" fill="var(--ink-3)">ΔV (mV)</text>
        <polyline points={`${X(0)},${y1 + 18} ${X(0.02)},${y1 + 18} ${X(0.02)},${y1 + 10} ${X(0.12)},${y1 + 10} ${X(0.12)},${y1 + 18} ${X(T)},${y1 + 18}`} fill="none" stroke="var(--ink-3)" />
        <text x={X(0.125)} y={y1 + 14} fontSize="9" fill="var(--ink-3)">20 pA for 100 ms</text>
        <polyline points={pts} fill="none" stroke="var(--neuro)" strokeWidth="2.2" />
        {dV > vmax && <text x={x1 - 4} y={y0 + 10} fontSize="9" textAnchor="end" fill="var(--warn)">off scale: {dV.toFixed(0)} mV</text>}
      </svg>
      <Slider label="cell diameter" value={d} min={5} max={100} step={1} onChange={setD} unit="μm" />
      <Slider label="specific membrane resistance" value={rm} min={5} max={100} step={1} onChange={setRm} unit="kΩ·cm²" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="capacitance" value={`${(C * 1e12).toFixed(1)} pF`} />
        <Stat label="input resistance" value={R >= 1e9 ? `${(R / 1e9).toFixed(2)} GΩ` : `${(R / 1e6).toFixed(0)} MΩ`} />
        <Stat label="time constant" value={`${(tau * 1e3).toFixed(0)} ms`} />
      </div>
      <p className="text-sm text-ink-2">Size changes how far the voltage moves (through the input resistance), but not how fast (the time constant). Only the membrane itself, through its specific resistance, sets the speed. A real voltage change this large would open voltage-gated channels; the figure shows the passive response only.</p>
    </div>
  );
}
