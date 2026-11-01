"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** A leaky integrate-and-fire neuron: drag the input current and watch it fire. */
export function LIFNeuron() {
  const [I, setI] = useState(2.2);       // input current (nA)
  const [tau, setTau] = useState(20);    // membrane time constant (ms)
  const T = 300, dt = 0.1, R = 10, vRest = -70, vTh = -54, vReset = -75;

  const { path, spikes } = useMemo(() => {
    let v = vRest;
    const pts: [number, number][] = [];
    const sp: number[] = [];
    for (let k = 0; k * dt <= T; k++) {
      const t = k * dt;
      const input = t >= 50 && t <= 250 ? I : 0;
      v += (dt / tau) * (vRest - v + R * input);
      if (v >= vTh) { sp.push(t); pts.push([t, vTh]); pts.push([t, 20]); v = vReset; }
      if (k % 5 === 0) pts.push([t, v]);
    }
    const x = (t: number) => 40 + (t / T) * 540;
    const y = (mv: number) => 20 + ((25 - mv) / 105) * 180;
    return { path: pts.map(([t, mv], i) => `${i ? "L" : "M"}${x(t).toFixed(1)},${y(mv).toFixed(1)}`).join(""), spikes: sp };
  }, [I, tau]);

  const y = (mv: number) => 20 + ((25 - mv) / 105) * 180;
  const rate = spikes.length / 0.2;
  const threshCurrent = (vTh - vRest) / R;

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 260" className="w-full" role="img" aria-label="Membrane voltage of a leaky integrate-and-fire neuron over 300 milliseconds">
        <rect x="40" y={y(25)} width="540" height="180" fill="var(--surface-2)" rx="6" />
        <line x1="40" x2="580" y1={y(vTh)} y2={y(vTh)} stroke="var(--neuro)" strokeDasharray="5 4" />
        <text x="575" y={y(vTh) - 5} textAnchor="end" fontSize="11" fill="var(--neuro)">threshold -54 mV</text>
        <line x1="40" x2="580" y1={y(vRest)} y2={y(vRest)} stroke="var(--ink-3)" strokeDasharray="2 4" />
        <text x="45" y={y(vRest) + 14} fontSize="11" fill="var(--ink-3)">rest -70 mV</text>
        <rect x={40 + (50 / T) * 540} y="225" width={(200 / T) * 540} height="10" fill="var(--accent)" opacity="0.35" rx="3" />
        <text x={40 + (150 / T) * 540} y="252" textAnchor="middle" fontSize="11" fill="var(--ink-2)">input on ({I.toFixed(2)} nA)</text>
        <path d={path} fill="none" stroke="var(--ink)" strokeWidth="1.6" />
        {[0, 100, 200, 300].map((t) => <text key={t} x={40 + (t / T) * 540} y="218" fontSize="10" fill="var(--ink-3)" textAnchor="middle">{t} ms</text>)}
      </svg>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Input current" value={I} min={0} max={4} step={0.05} unit="nA" onChange={setI} fmt={(v) => v.toFixed(2)} />
        <Slider label="Membrane time constant τ" value={tau} min={5} max={50} step={1} unit="ms" onChange={setTau} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Spikes" value={String(spikes.length)} />
        <Stat label="Firing rate" value={`${rate.toFixed(0)} Hz`} />
        <Stat label="Current needed to fire" value={`${threshCurrent.toFixed(2)} nA`} />
      </div>
    </div>
  );
}
