"use client";

import { useMemo, useState } from "react";
import { solveTri } from "./cable-epsp";
import { hhRates } from "./hh";
import { Slider, Stat } from "./util";

const Nd = 50;

function run(site: number, amp: number) {
  const As = Math.PI * (20e-4) ** 2, ddx = 500e-4 / Nd, Ad = Math.PI * 2e-4 * ddx, dt = 0.01, n = Nd + 1;
  const C = [As * 1e3, ...new Array(Nd).fill(Ad * 1e3)];
  const gL = [0.3e-3 * As * 1e6, ...new Array(Nd).fill((Ad / 20000) * 1e6)];
  const EL = [-54.387, ...new Array(Nd).fill(-65)];
  const gax = ((Math.PI * (2e-4) ** 2) / (4 * 150 * ddx)) * 1e6, g0 = (1 / ((4 * 150 * (ddx / 2)) / (Math.PI * (2e-4) ** 2))) * 1e6;
  const g = [g0, ...new Array(Nd - 1).fill(gax)], off = g.map((x) => -x * dt);
  const diag = C.map((c, i) => c + gL[i] * dt + (i < n - 1 ? g[i] * dt : 0) + (i > 0 ? g[i - 1] * dt : 0));
  let V = new Array(n).fill(-65), gn = 0.3177, gm = 0.0529, gh = 0.5961;
  const soma: number[] = [], tip: number[] = [];
  for (let s = 0; s * dt < 15; s++) {
    const r = hhRates(V[0]);
    const I0 = (120 * gm ** 3 * gh * (V[0] - 50) + 36 * gn ** 4 * (V[0] + 77)) * As * 1e3;
    gn += dt * (r.an * (1 - gn) - r.bn * gn); gm += dt * (r.am * (1 - gm) - r.bm * gm); gh += dt * (r.ah * (1 - gh) - r.bh * gh);
    const rhs = V.map((v, i) => C[i] * v + dt * (gL[i] * EL[i] - (i === 0 ? I0 : 0) + (i === site && s * dt >= 1 && s * dt < 2 ? amp : 0)));
    V = solveTri(off, diag, off, rhs);
    if (s % 5 === 0) { soma.push(V[0]); tip.push(V[n - 1]); }
  }
  return { soma, tip };
}

/** Ball-and-stick neuron: a 20 μm Hodgkin-Huxley soma and a passive 2 μm, 500 μm dendrite, stimulated by a 1 ms pulse at the soma or the dendrite's tip. */
export function BallAndStick() {
  const [atTip, setAtTip] = useState(false);
  const [amp, setAmp] = useState(0.3);
  const { soma, tip } = useMemo(() => run(atTip ? Nd : 0, amp), [atTip, amp]);
  const W = 360, H = 190, x0 = 34, x1 = 350, y0 = 10, y1 = 175;
  const X = (i: number) => x0 + (i / (soma.length - 1)) * (x1 - x0);
  const Y = (v: number) => y1 - ((Math.max(-80, Math.min(50, v)) + 80) / 130) * (y1 - y0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${!atTip ? "btn-primary" : ""}`} onClick={() => setAtTip(false)}>inject at the soma</button>
        <button className={`btn !py-1.5 ${atTip ? "btn-primary" : ""}`} onClick={() => setAtTip(true)}>inject at the tip</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Voltage at the soma and the dendrite tip of a ball-and-stick neuron">
        {[-60, -20, 20].map((v) => <g key={v}><line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="var(--line)" /><text x={x0 - 4} y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text></g>)}
        <polyline points={soma.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={tip.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x={x1} y={y0 + 8} fontSize="9" textAnchor="end" fill="var(--neuro)">soma</text>
        <text x={x1} y={y0 + 20} fontSize="9" textAnchor="end" fill="var(--ai)">dendrite tip (500 μm)</text>
        <text x={x1} y={H - 2} fontSize="9" textAnchor="end" fill="var(--ink-3)">0 to 15 ms</text>
      </svg>
      <Slider label="1 ms current pulse" value={amp} min={0} max={1} step={0.01} onChange={setAmp} unit="nA" fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="soma peak" value={`${Math.max(...soma).toFixed(1)} mV`} />
        <Stat label="tip peak" value={`${Math.max(...tip).toFixed(1)} mV`} />
      </div>
      <p className="text-sm text-ink-2">At the soma about 0.2 nA fires a spike; at the tip more than twice that is needed, because much of the current leaks out of the dendrite on its way. When the soma fires, the spike spreads back into the passive dendrite but arrives at the tip smaller and slower. In real neurons, sodium channels in the dendrites help the spike propagate back, a subject of tomorrow.</p>
    </div>
  );
}
