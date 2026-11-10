"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const PRESETS: Record<string, { a: number; b: number; tw: number; Vr: number; I: number }> = {
  tonic: { a: 0, b: 5, tw: 30, Vr: -58, I: 500 },
  adapting: { a: 0, b: 60, tw: 200, Vr: -58, I: 500 },
  bursting: { a: 0, b: 60, tw: 100, Vr: -45, I: 300 },
  phasic: { a: 30, b: 10, tw: 200, Vr: -58, I: 350 },
};

function run(p: { a: number; b: number; tw: number; Vr: number; I: number }) {
  const C = 200, gL = 10, EL = -70, VT = -50, DT = 2, dt = 0.05, T = 600;
  let V = EL, w = 0;
  const vs: number[] = [], spikes: number[] = [];
  for (let k = 0; k * dt < T; k++) {
    const t = k * dt, I = t >= 50 ? p.I : 0;
    const dV = (-gL * (V - EL) + gL * DT * Math.exp(Math.min((V - VT) / DT, 30)) - w + I) / C;
    const dw = (p.a * (V - EL) - w) / p.tw;
    V += dt * dV; w += dt * dw;
    let shown = V;
    if (V > 0) { V = p.Vr; w += p.b; spikes.push(t); shown = 20; }
    if (k % 4 === 0) vs.push(Math.min(shown, 20));
  }
  return { vs, spikes };
}

/** AdEx neuron (C = 200 pF, gL = 10 nS, EL = -70 mV, VT = -50 mV, ΔT = 2 mV) responding to a 550 ms current step, with presets for common firing patterns. */
export function AdExPatterns() {
  const [p, setP] = useState(PRESETS.adapting);
  const [name, setName] = useState("adapting");
  const { vs, spikes } = useMemo(() => run(p), [p]);
  const set = (k: keyof typeof p, v: number) => { setP({ ...p, [k]: v }); setName("custom"); };
  const isi = spikes.slice(1).map((s, i) => s - spikes[i]);
  const W = 360, H = 170, x0 = 10, x1 = 350, y0 = 10, y1 = 160;
  const X = (i: number) => x0 + (i / (vs.length - 1)) * (x1 - x0);
  const Y = (v: number) => y1 - ((v + 75) / 95) * (y1 - y0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.keys(PRESETS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => { setP(PRESETS[k]); setName(k); }}>{k}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Voltage trace of an AdEx neuron during a current step">
        <polyline points={vs.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.2" />
        <line x1={X((50 / 600) * (vs.length - 1))} x2={x1} y1={y1 - 2} y2={y1 - 2} stroke="var(--ink-3)" strokeWidth="3" />
        <text x={x1} y={y0 + 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">600 ms; bar: current on</text>
      </svg>
      <Slider label="spike-triggered adaptation b" value={p.b} min={0} max={120} step={1} onChange={(v) => set("b", v)} unit="pA" />
      <Slider label="reset voltage V_r" value={p.Vr} min={-65} max={-42} step={0.5} onChange={(v) => set("Vr", v)} unit="mV" />
      <Slider label="adaptation time constant τ_w" value={p.tw} min={10} max={400} step={5} onChange={(v) => set("tw", v)} unit="ms" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="spikes" value={`${spikes.length}`} />
        <Stat label="first interval" value={isi.length ? `${isi[0].toFixed(1)} ms` : "none"} />
        <Stat label="last interval" value={isi.length ? `${isi[isi.length - 1].toFixed(1)} ms` : "none"} />
      </div>
      <p className="text-sm text-ink-2">Start from a preset and move one slider at a time. Raising b lengthens later intervals (adaptation); raising the reset towards the spike-initiation zone turns single spikes into bursts; shortening τ_w lets adaptation wear off between bursts. Real cortical cell types show all of these patterns.</p>
    </div>
  );
}
