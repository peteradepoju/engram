"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { Slider, Stat } from "./util";

/** The FitzHugh-Nagumo phase plane: nullclines, a draggable starting point and the resulting trajectory. */
export function FitzHughNagumo() {
  const [I, setI] = useState(0);
  const [v0, setV0] = useState(-0.4);
  const [w0, setW0] = useState(-0.62);
  const a = 0.7, b = 0.8, eps = 0.08;
  const W = 360, H = 230;
  const X = (v: number) => 20 + ((v + 2.5) / 5) * (W - 30), Y = (w: number) => 10 + ((2 - w) / 3) * (H - 40);
  const drag = useSvgDrag((_, x, y) => {
    setV0(Math.max(-2.4, Math.min(2.4, ((x - 20) / (W - 30)) * 5 - 2.5)));
    setW0(Math.max(-0.95, Math.min(1.95, 2 - ((y - 10) / (H - 40)) * 3)));
  });
  const vs = Array.from({ length: 101 }, (_, i) => -2.5 + i * 0.05);
  const path = (g: (v: number) => number) => vs.map((v, i) => { const w = g(v), ok = w >= -1 && w <= 2; return ok ? `${i && g(vs[i - 1]) >= -1 && g(vs[i - 1]) <= 2 ? "L" : "M"}${X(v)},${Y(w)}` : ""; }).join(" ");
  const vNull = path((v) => v - v ** 3 / 3 + I), wNull = path((v) => (v + a) / b);
  let v = v0, w = w0; const traj: string[] = [], vt: number[] = [];
  for (let k = 0; k < 2000; k++) {
    traj.push(`${X(v)},${Y(w)}`); vt.push(v);
    const dv = v - v ** 3 / 3 - w + I, dw = eps * (v + a - b * w);
    v += 0.1 * dv; w += 0.1 * dw;
  }
  const peak = Math.max(...vt);
  const tail = vt.slice(1200), osc = Math.max(...tail) - Math.min(...tail) > 1;
  const sy = (x: number) => H + 30 - ((x + 2.5) / 5) * 40;
  return (
    <div className="space-y-3">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${H + 40}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="FitzHugh-Nagumo phase plane and voltage trace">
        <line x1="20" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <line x1={X(0)} x2={X(0)} y1="10" y2={H - 30} stroke="var(--line)" />
        <path d={vNull} fill="none" stroke="var(--neuro)" strokeWidth="1.5" strokeDasharray="5 3" />
        <path d={wNull} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="5 3" />
        <polyline points={traj.join(" ")} fill="none" stroke="var(--ink)" strokeWidth="2" />
        <circle cx={X(v0)} cy={Y(w0)} r="7" fill="var(--warn)" {...drag.handle("p")} />
        <text x={W - 12} y={Y(0) + 12} fontSize="10" textAnchor="end" fill="var(--ink-3)">v</text>
        <text x={X(0) + 4} y="20" fontSize="10" fill="var(--ink-3)">w</text>
        <text x={W - 14} y="20" fontSize="9" textAnchor="end" fill="var(--neuro)">v-nullcline</text>
        <text x={W - 14} y="32" fontSize="9" textAnchor="end" fill="var(--ai)">w-nullcline</text>
        <line x1="20" x2={W - 10} y1={H - 12} y2={H - 12} stroke="var(--line)" />
        <polyline points={vt.map((x, k) => `${20 + (k / 2000) * (W - 30)},${sy(x)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
        <text x="24" y={H - 2} fontSize="9" fill="var(--ink-3)">v against time</text>
      </svg>
      <Slider label="input current I" value={I} min={0} max={1.5} step={0.01} onChange={setI} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak v (drag the start)" value={peak.toFixed(2)} />
        <Stat label="behaviour" value={osc ? "oscillating" : peak > 1 ? "one spike" : "returns quietly"} />
      </div>
      <p className="text-sm text-ink-2">FitzHugh's two-variable caricature of the Hodgkin-Huxley neuron: a fast voltage-like variable v and a slow recovery variable w. The dashed curves are the nullclines, where v or w stops changing; the resting state is where they cross. Start just to the left of the middle branch of the cubic and the trajectory returns quietly; start just to the right and it makes a large excursion, a spike, before returning. Raise the input and the resting state loses stability, and the neuron fires repetitively.</p>
    </div>
  );
}
