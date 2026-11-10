"use client";

import { useMemo, useState } from "react";
import { solveTri } from "./cable-epsp";
import { hhRates } from "./hh";
import { Slider, Stat } from "./util";

const N = 70, dx = 0.05, dt = 0.01, T = 10, rec = [10, 30, 50, 69];

function simulate(dCm: number, myelin: boolean) {
  const gc = (1000 * dCm) / (4 * 35.4 * dx * dx);
  const active = Array.from({ length: N }, (_, i) => !myelin || i % 5 === 0);
  const cm = active.map((a) => (a ? 1 : 1 / 50)), gl = active.map((a) => (a ? 0.3 : 0.3 / 50));
  const off = new Array(N - 1).fill(-gc * dt);
  const diag = cm.map((c, i) => c + gc * dt * (i === 0 || i === N - 1 ? 1 : 2));
  let V = new Array(N).fill(-65);
  const n = new Array(N).fill(0.3177), m = new Array(N).fill(0.0529), h = new Array(N).fill(0.5961);
  const traces = rec.map(() => [] as number[]), cross = new Array(N).fill(NaN);
  for (let s = 0; s * dt < T; s++) {
    const rhs = new Array(N);
    for (let i = 0; i < N; i++) {
      const r = hhRates(V[i]);
      const Iion = (active[i] ? 120 * m[i] ** 3 * h[i] * (V[i] - 50) + 36 * n[i] ** 4 * (V[i] + 77) : 0) + gl[i] * (V[i] + 54.387);
      n[i] += dt * (r.an * (1 - n[i]) - r.bn * n[i]); m[i] += dt * (r.am * (1 - m[i]) - r.bm * m[i]); h[i] += dt * (r.ah * (1 - h[i]) - r.bh * h[i]);
      rhs[i] = cm[i] * V[i] + dt * ((i < 3 && s * dt < 0.5 ? 500 : 0) - Iion);
    }
    const Vn = solveTri(off, diag, off, rhs);
    for (let i = 0; i < N; i++) if (isNaN(cross[i]) && Vn[i] > 0 && V[i] <= 0) cross[i] = s * dt;
    V = Vn;
    if (s % 4 === 0) rec.forEach((k, j) => traces[j].push(V[k]));
  }
  const i1 = 20, i2 = 50, v = ((i2 - i1) * dx * 10) / (cross[i2] - cross[i1]);
  return { traces, v };
}

/** A Hodgkin-Huxley axon (squid kinetics, 6.3 °C) in 0.5 mm compartments, stimulated at one end; optional model myelin with a node every fifth compartment. */
export function AxonPropagation() {
  const [d, setD] = useState(240);
  const [myelin, setMyelin] = useState(false);
  const { traces, v } = useMemo(() => simulate(d * 1e-4, myelin), [d, myelin]);
  const W = 360, H = 200, x0 = 30, x1 = 350, y0 = 10, y1 = 185;
  const X = (i: number) => x0 + (i / (traces[0].length - 1)) * (x1 - x0);
  const Y = (val: number) => y1 - ((Math.max(-80, Math.min(50, val)) + 80) / 130) * (y1 - y0);
  const colours = ["var(--neuro)", "var(--warn)", "var(--good)", "var(--ai)"];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${!myelin ? "btn-primary" : ""}`} onClick={() => setMyelin(false)}>bare axon</button>
        <button className={`btn !py-1.5 ${myelin ? "btn-primary" : ""}`} onClick={() => setMyelin(true)}>model myelin</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Voltage recorded at four points along an axon as a spike passes">
        {traces.map((tr, j) => <polyline key={j} points={tr.map((val, i) => `${X(i)},${Y(val)}`).join(" ")} fill="none" stroke={colours[j]} strokeWidth="1.8" />)}
        {rec.map((k, j) => <text key={k} x={x1} y={y0 + 10 + j * 11} fontSize="9" textAnchor="end" fill={colours[j]}>{(k * dx * 10).toFixed(1)} mm along</text>)}
        <text x={x1} y={H - 2} fontSize="9" textAnchor="end" fill="var(--ink-3)">0 to 10 ms</text>
      </svg>
      <Slider label="axon diameter" value={d} min={60} max={500} step={10} onChange={setD} unit="μm" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="conduction velocity" value={isFinite(v) ? `${v.toFixed(1)} m/s` : "no spike"} />
        <Stat label="mode" value={myelin ? "saltatory" : "continuous"} />
      </div>
      <p className="text-sm text-ink-2">The same spike passes four recording points in turn; the gap between the traces is the travel time. Doubling the bare axon's diameter speeds it by about the square root of two. Model myelin, with a node every 2.5 mm and fifty times less capacitance and leak between nodes, roughly doubles the speed at the same diameter.</p>
    </div>
  );
}
