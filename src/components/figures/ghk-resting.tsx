"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** The GHK resting potential against external potassium (log axis), beside the potassium Nernst line, for an adjustable sodium-to-potassium permeability ratio. Mammalian concentrations at 37 °C. */
export function GHKResting() {
  const [b, setB] = useState(0.05);
  const [ko, setKo] = useState(5);
  const VT = 26.725, Ki = 140, Nao = 145, Nai = 12;
  const ghk = (K: number) => VT * Math.log((K + b * Nao) / (Ki + b * Nai));
  const ek = (K: number) => VT * Math.log(K / Ki);
  const W = 360, H = 220, x0 = 40, x1 = 345, y0 = 14, y1 = 190;
  const X = (K: number) => x0 + ((Math.log10(K) - 0) / (Math.log10(140) - 0)) * (x1 - x0);
  const Y = (v: number) => y0 + ((20 - v) / 140) * (y1 - y0);
  const ks = Array.from({ length: 80 }, (_, i) => 10 ** ((i / 79) * Math.log10(140)));
  const path = (f: (K: number) => number) => ks.map((K) => `${X(K)},${Y(Math.max(-120, f(K)))}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Resting potential against external potassium concentration, with the Nernst line">
        {[0, -40, -80, -120].map((v) => (
          <g key={v}>
            <line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="var(--line)" />
            <text x={x0 - 4} y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text>
          </g>
        ))}
        {[1, 3, 10, 30, 100].map((K) => <text key={K} x={X(K)} y={H - 16} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{K}</text>)}
        <text x={x1} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">[K]out (mM, log scale)</text>
        <text x={x0 + 2} y={y0 + 2} fontSize="9" fill="var(--ink-3)">mV</text>
        <polyline points={path(ek)} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth="1.5" />
        <polyline points={path(ghk)} fill="none" stroke="var(--ai)" strokeWidth="2.2" />
        <line x1={X(ko)} x2={X(ko)} y1={Y(ghk(ko))} y2={Y(ek(ko))} stroke="var(--warn)" strokeWidth="1.5" />
        <circle cx={X(ko)} cy={Y(ghk(ko))} r="4" fill="var(--ai)" />
        <circle cx={X(ko)} cy={Y(ek(ko))} r="3" fill="var(--ink-3)" />
        <text x={x1 - 4} y={Y(ek(110)) - 18} fontSize="9" textAnchor="end" fill="var(--ink-3)">E_K (Nernst)</text>
        <text x={X(1.5)} y={Y(ghk(1.5)) - 8} fontSize="9" fill="var(--ai)">GHK rest</text>
      </svg>
      <Slider label="permeability ratio P_Na / P_K" value={b} min={0} max={0.3} step={0.005} onChange={setB} fmt={(v) => v.toFixed(3)} />
      <Slider label="external potassium" value={ko} min={1} max={140} step={1} onChange={setKo} unit="mM" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="resting potential" value={`${ghk(ko).toFixed(1)} mV`} />
        <Stat label="above E_K by" value={`${(ghk(ko) - ek(ko)).toFixed(1)} mV`} />
      </div>
      <p className="text-sm text-ink-2">With no sodium permeability the resting potential is the Nernst line. A small ratio barely matters at high external potassium, where the potassium terms dominate, but bends the curve away from the line at low potassium. That bend is how Hodgkin and Katz measured the ratio. Raising external potassium depolarises cells, which is why high blood potassium is dangerous for the heart.</p>
    </div>
  );
}
