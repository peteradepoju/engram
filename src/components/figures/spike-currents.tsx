"use client";

import { useMemo, useState } from "react";
import { simulateHH } from "./hh";
import { Slider, Stat } from "./util";

/** An HH action potential and its sodium and potassium currents at an adjustable temperature (all rates scaled by 3^((T - 6.3)/10)). */
export function SpikeCurrents() {
  const [T, setT] = useState(6.3);
  const dt = 0.004;
  const tr = useMemo(() => simulateHH((t) => (t >= 1 && t < 1.3 ? 100 : 0), 8, dt, { phi: 3 ** ((T - 6.3) / 10), every: 5 }), [T]);
  const peak = Math.max(...tr.V);
  const qNa = -tr.INa.reduce((a, v) => a + Math.min(v, 0), 0) * dt * 5;
  const ratio = qNa / (peak + 65);
  const hw = tr.V.filter((v) => v > (peak - 65) / 2).length * dt * 5;
  const W = 360, H = 250, x0 = 34, x1 = 350;
  const X = (t: number) => x0 + (t / 8) * (x1 - x0);
  const Yv = (v: number) => 100 - ((v + 80) / 130) * 88;
  const Yi = (i: number) => 175 - (Math.max(-1000, Math.min(1000, i)) / 1000) * 65;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="An action potential and its sodium and potassium currents">
        {[-50, 0, 50].map((v) => <g key={v}><line x1={x0} x2={x1} y1={Yv(v)} y2={Yv(v)} stroke="var(--line)" /><text x={x0 - 4} y={Yv(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text></g>)}
        <text x={x0 + 2} y="10" fontSize="9" fill="var(--ink-3)">V (mV)</text>
        <polyline points={tr.t.map((t, i) => `${X(t)},${Yv(tr.V[i])}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="2" />
        {[-1000, 0, 1000].map((v) => <g key={v}><line x1={x0} x2={x1} y1={Yi(v)} y2={Yi(v)} stroke="var(--line)" /><text x={x0 - 4} y={Yi(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v / 1000}</text></g>)}
        <text x={x0 + 2} y="118" fontSize="9" fill="var(--ink-3)">current (mA/cm², outward up)</text>
        <polyline points={tr.t.map((t, i) => `${X(t)},${Yi(tr.INa[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        <polyline points={tr.t.map((t, i) => `${X(t)},${Yi(tr.IK[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.8" />
        <text x={x1 - 2} y="130" fontSize="9" textAnchor="end" fill="var(--ai)">potassium</text>
        <text x={x1 - 2} y="230" fontSize="9" textAnchor="end" fill="var(--neuro)">sodium</text>
        <text x={x1} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">0 to 8 ms</text>
      </svg>
      <Slider label="temperature" value={T} min={6.3} max={36} step={0.1} onChange={setT} unit="°C" fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="peak" value={`${peak.toFixed(0)} mV`} />
        <Stat label="half-width" value={`${hw.toFixed(2)} ms`} />
        <Stat label="sodium / minimum" value={ratio.toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">At 6.3 °C the sodium current keeps flowing while the potassium current rises, and the two cancel for over a millisecond. Warming speeds every gate threefold per 10 °C, so the spike narrows, its peak falls and less sodium is wasted. Above about 30 °C the gates are so fast relative to the membrane's charging that the spike shrinks towards the depolarisation produced by the stimulus alone, a heat block.</p>
    </div>
  );
}
