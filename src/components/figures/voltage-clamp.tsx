"use client";

import { useState } from "react";
import { HH, infTau } from "./hh";
import { Slider, Stat } from "./util";

/** Ionic currents after a voltage-clamp step from -65 mV, computed from the exponential relaxation of the HH gates. */
export function VoltageClamp() {
  const [V, setV] = useState(0);
  const ts = Array.from({ length: 201 }, (_, i) => i * 0.05);
  const g = (name: "m" | "h" | "n") => { const a = infTau(V, name), x0 = infTau(-65, name).inf; return ts.map((t) => a.inf - (a.inf - x0) * Math.exp(-t / a.tau)); };
  const m = g("m"), h = g("h"), n = g("n");
  const INa = ts.map((_, i) => HH.gNa * m[i] ** 3 * h[i] * (V - HH.ENa));
  const IK = ts.map((_, i) => HH.gK * n[i] ** 4 * (V - HH.EK));
  const tot = ts.map((_, i) => INa[i] + IK[i]);
  const W = 360, H = 220, x0 = 40, x1 = 350, ymid = 110, sc = 85 / 3000;
  const X = (t: number) => x0 + (t / 10) * (x1 - x0);
  const Y = (I: number) => ymid - Math.max(-3600, Math.min(3600, I)) * sc;
  const path = (a: number[]) => a.map((v, i) => `${X(ts[i])},${Y(v)}`).join(" ");
  const peakNa = INa.reduce((p, v) => (Math.abs(v) > Math.abs(p) ? v : p), 0);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Sodium, potassium and total currents during a voltage-clamp step">
        {[-3000, -1500, 0, 1500, 3000].map((I) => (
          <g key={I}>
            <line x1={x0} x2={x1} y1={Y(I)} y2={Y(I)} stroke="var(--line)" />
            <text x={x0 - 4} y={Y(I) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{I / 1000}</text>
          </g>
        ))}
        <text x={x0 + 2} y="12" fontSize="9" fill="var(--ink-3)">mA/cm² (outward up)</text>
        <polyline points={path(INa)} fill="none" stroke="var(--neuro)" strokeWidth="1.6" strokeDasharray="4 2" />
        <polyline points={path(IK)} fill="none" stroke="var(--ai)" strokeWidth="1.6" strokeDasharray="4 2" />
        <polyline points={path(tot)} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
        <text x={x1} y={H - 6} fontSize="9" textAnchor="end" fill="var(--ink-3)">time after the step (0 to 10 ms)</text>
        <text x={x1 - 2} y="24" fontSize="9" textAnchor="end" fill="var(--ai)">potassium</text>
        <text x={x1 - 2} y="36" fontSize="9" textAnchor="end" fill="var(--neuro)">sodium</text>
        <text x={x1 - 2} y="48" fontSize="9" textAnchor="end" fill="var(--ink)">total</text>
      </svg>
      <Slider label="step to" value={V} min={-80} max={90} step={5} onChange={setV} unit="mV" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak sodium current" value={`${(peakNa / 1000).toFixed(2)} mA/cm²`} />
        <Stat label="potassium at 10 ms" value={`${(IK[IK.length - 1] / 1000).toFixed(2)} mA/cm²`} />
      </div>
      <p className="text-sm text-ink-2">Small steps open few channels. Larger steps open more sodium channels, but the sodium current shrinks as the step approaches the sodium reversal potential (+50 mV here), and above it the sodium current flows outward. The potassium current only grows. Dividing each current by its driving force turns these shapes into conductances that rise smoothly with voltage.</p>
    </div>
  );
}
