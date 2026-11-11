"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const RECEPTORS: Record<string, { tr: number; td: number; E: number; c: string }> = {
  AMPA: { tr: 0.2, td: 2, E: 0, c: "var(--neuro)" },
  NMDA: { tr: 2, td: 80, E: 0, c: "var(--warn)" },
  "GABA-A": { tr: 0.5, td: 8, E: -75, c: "var(--ai)" },
  "GABA-B": { tr: 30, td: 200, E: -90, c: "var(--good)" },
};

function dexp(t: number, tr: number, td: number) {
  if (t <= 0) return 0;
  const tp = ((tr * td) / (td - tr)) * Math.log(td / tr), norm = 1 / (Math.exp(-tp / td) - Math.exp(-tp / tr));
  return norm * (Math.exp(-t / td) - Math.exp(-t / tr));
}

/** A train of five synaptic inputs onto a passive membrane (200 pF, 10 nS, rest -60 mV, 1 nS peak conductance), for four receptor types. NMDA's magnesium block is ignored. */
export function SynapseKinetics() {
  const [name, setName] = useState("AMPA");
  const [f, setF] = useState(20);
  const R = RECEPTORS[name];
  const T = 600, dt = 0.1;
  const { g, v } = useMemo(() => {
    const times = Array.from({ length: 5 }, (_, i) => 20 + (i * 1000) / f);
    const g: number[] = [], v: number[] = [];
    let V = -60;
    for (let k = 0; k * dt < T; k++) {
      const t = k * dt, gk = times.reduce((a, s) => a + dexp(t - s, R.tr, R.td), 0);
      V += (dt * (-10 * (V + 60) - gk * (V - R.E))) / 200;
      if (k % 2 === 0) { g.push(gk); v.push(V + 60); }
    }
    return { g, v };
  }, [name, f, R]);
  const W = 360, H = 210, x0 = 30, x1 = 350;
  const X = (i: number) => x0 + (i / (g.length - 1)) * (x1 - x0);
  const gmax = Math.max(...g, 1e-9), vmax = Math.max(...v.map(Math.abs), 1e-9);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.keys(RECEPTORS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => setName(k)}>{k}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Synaptic conductance and postsynaptic potential for a train of inputs">
        <text x={x0} y="12" fontSize="9" fill="var(--ink-3)">conductance (scaled to its peak)</text>
        <polyline points={g.map((x, i) => `${X(i)},${95 - (x / gmax) * 75}`).join(" ")} fill="none" stroke={R.c} strokeWidth="1.8" />
        <text x={x0} y="115" fontSize="9" fill="var(--ink-3)">postsynaptic potential (scaled; {v[v.length - 1] < 0 || Math.min(...v) < -0.01 ? "hyperpolarising" : "depolarising"})</text>
        <polyline points={v.map((x, i) => `${X(i)},${200 - (Math.abs(x) / vmax) * 75}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.8" />
        <text x={x1} y={H - 2} fontSize="9" textAnchor="end" fill="var(--ink-3)">0 to 600 ms</text>
      </svg>
      <Slider label="input rate" value={f} min={5} max={100} step={1} onChange={setF} unit="Hz" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak conductance" value={`${gmax.toFixed(2)} nS`} />
        <Stat label="largest potential" value={`${(Math.sign(v[v.reduce((a, x, i) => (Math.abs(x) > Math.abs(v[a]) ? i : a), 0)]) * vmax).toFixed(2)} mV`} />
      </div>
      <p className="text-sm text-ink-2">Five inputs, each opening 1 nS of conductance at its peak. Fast AMPA conductances stay separate at all but the highest rates; the potential they cause lasts as long as the membrane's time constant. NMDA and GABA-B conductances outlast the gaps between inputs and pile up, so the potential grows through the train. (This figure sums waveforms linearly; the kinetic model of Step 3 would saturate at high rates.)</p>
    </div>
  );
}
