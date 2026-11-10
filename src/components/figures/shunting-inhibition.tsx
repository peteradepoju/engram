"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const C = 200, gL = 10, EL = -70, Ee = 0, dt = 0.05, T = 80;

function run(gInh: number, Ei: number) {
  const v: number[] = [];
  let V = (gL * EL + gInh * Ei) / (gL + gInh);
  for (let k = 0; k * dt <= T; k++) {
    const s = k * dt - 20;
    const ge = s > 0 ? 6 * (s / 2) * Math.exp(1 - s / 2) : 0;
    V += (dt / C) * (-gL * (V - EL) - ge * (V - Ee) - gInh * (V - Ei));
    v.push(V);
  }
  return v;
}

/** A brief excitatory conductance (alpha function, peak 6 nS) on a passive membrane, with and without a sustained inhibitory conductance of adjustable size and reversal potential. */
export function ShuntingInhibition() {
  const [gi, setGi] = useState(10);
  const [Ei, setEi] = useState(-70);
  const base = useMemo(() => run(0, -70), []);
  const inh = useMemo(() => run(gi, Ei), [gi, Ei]);
  const W = 360, H = 200, x0 = 36, x1 = 350, y0 = 14, y1 = 180, vlo = -92, vhi = -50;
  const X = (k: number) => x0 + ((k * dt) / T) * (x1 - x0);
  const Y = (v: number) => y1 - ((Math.max(vlo, Math.min(vhi, v)) - vlo) / (vhi - vlo)) * (y1 - y0);
  const line = (v: number[]) => v.filter((_, k) => k % 4 === 0).map((x, j) => `${X(j * 4)},${Y(x)}`).join(" ");
  const peak = (v: number[]) => Math.max(...v) - v[0];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Excitatory postsynaptic potentials with and without inhibition">
        {[-90, -80, -70, -60, -50].map((v) => (
          <g key={v}>
            <line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="var(--line)" />
            <text x={x0 - 4} y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text>
          </g>
        ))}
        <text x={x0 + 2} y={y0 - 2} fontSize="9" fill="var(--ink-3)">mV</text>
        <polyline points={line(base)} fill="none" stroke="var(--ink-3)" strokeWidth="1.8" />
        <polyline points={line(inh)} fill="none" stroke="var(--ai)" strokeWidth="2.2" />
        <line x1={X(20 / dt)} x2={X(20 / dt)} y1={y1} y2={y1 - 8} stroke="var(--neuro)" strokeWidth="2" />
        <text x={X(20 / dt) + 3} y={y1 - 2} fontSize="9" fill="var(--neuro)">excitatory input</text>
        <text x={x1 - 2} y={y0 + 10} fontSize="9" textAnchor="end" fill="var(--ink-3)">grey: no inhibition</text>
        <text x={x1 - 2} y={y0 + 22} fontSize="9" textAnchor="end" fill="var(--ai)">blue: with inhibition</text>
      </svg>
      <Slider label="inhibitory conductance" value={gi} min={0} max={40} step={1} onChange={setGi} unit="nS" />
      <Slider label="inhibitory reversal potential" value={Ei} min={-90} max={-50} step={1} onChange={setEi} unit="mV" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="EPSP alone" value={`${peak(base).toFixed(2)} mV`} />
        <Stat label="with inhibition" value={`${peak(inh).toFixed(2)} mV`} />
        <Stat label="time constant" value={`${(C / (gL + gi)).toFixed(1)} ms`} />
      </div>
      <p className="text-sm text-ink-2">A cell with 200 pF and a 10 nS leak at -70 mV. With the inhibitory reversal at -70 mV, the inhibition does not move the baseline at all, yet the EPSP shrinks and becomes briefer: pure shunting. Moving the reversal below rest adds hyperpolarisation; moving it above rest makes the inhibition depolarise the cell on its own, although it still reduces the EPSP, as GABA-A inhibition can in neurons with high internal chloride.</p>
    </div>
  );
}
