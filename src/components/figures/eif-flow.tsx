"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** dV/dt of an exponential integrate-and-fire neuron (C = 200 pF, gL = 10 nS, EL = -65 mV, VT = -52 mV) against V, with its fixed points. */
export function EIFFlow() {
  const [dT, setDT] = useState(1.5);
  const [I, setI] = useState(80);
  const C = 200, gL = 10, EL = -65, VT = -52;
  const f = (V: number) => (-gL * (V - EL) + gL * dT * Math.exp(Math.min((V - VT) / dT, 30)) + I) / C;
  const W = 360, H = 220, x0 = 36, x1 = 350, y0 = 12, y1 = 200, vlo = -75, vhi = -40, flo = -0.6, fhi = 0.8;
  const X = (V: number) => x0 + ((V - vlo) / (vhi - vlo)) * (x1 - x0);
  const Y = (d: number) => y1 - ((Math.max(flo, Math.min(fhi, d)) - flo) / (fhi - flo)) * (y1 - y0);
  const Vs = Array.from({ length: 351 }, (_, i) => vlo + (i / 350) * (vhi - vlo));
  const roots: { V: number; stable: boolean }[] = [];
  for (let i = 1; i < Vs.length; i++) {
    const a = f(Vs[i - 1]), b = f(Vs[i]);
    if (a === 0 || Math.sign(a) !== Math.sign(b)) roots.push({ V: Vs[i - 1] - (a * (Vs[i] - Vs[i - 1])) / (b - a), stable: a > b });
  }
  const rheo = gL * (VT - EL - dT);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Rate of change of voltage against voltage for an exponential integrate-and-fire neuron">
        {[-70, -60, -50, -40].map((V) => <text key={V} x={X(V)} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{V}</text>)}
        <line x1={x0} x2={x1} y1={Y(0)} y2={Y(0)} stroke="var(--ink-3)" />
        <line x1={X(VT)} x2={X(VT)} y1={y0} y2={y1} stroke="var(--line)" strokeDasharray="3 3" />
        <text x={X(VT) + 3} y={y0 + 10} fontSize="9" fill="var(--ink-3)">V_T</text>
        <text x={x0 + 2} y={y0 + 10} fontSize="9" fill="var(--ink-3)">dV/dt (mV/ms)</text>
        <polyline points={Vs.map((V) => `${X(V)},${Y(f(V))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.2" />
        {roots.map((r, i) => <circle key={i} cx={X(r.V)} cy={Y(0)} r="5" fill={r.stable ? "var(--ai)" : "var(--surface-2)"} stroke="var(--ai)" strokeWidth="2" />)}
      </svg>
      <Slider label="slope factor ΔT" value={dT} min={0.2} max={6} step={0.1} onChange={setDT} unit="mV" fmt={(v) => v.toFixed(1)} />
      <Slider label="input current" value={I} min={0} max={200} step={1} onChange={setI} unit="pA" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="rheobase" value={`${rheo.toFixed(0)} pA`} />
        <Stat label="state" value={roots.length >= 2 ? `rest at ${roots[0].V.toFixed(1)} mV` : "fires repetitively"} />
      </div>
      <p className="text-sm text-ink-2">Where the curve is above zero the voltage rises; below zero it falls. The filled circle is the resting state, the open circle the unstable point beyond which the voltage runs away into a spike. Raising the input lifts the curve until the two points merge and vanish at the rheobase. A small ΔT makes the upswing a near-vertical wall at V_T, as in the integrate-and-fire neuron; a large ΔT makes it gradual, and lowers the rheobase.</p>
    </div>
  );
}
