"use client";

import { useState } from "react";
import { useChurchland } from "./churchland-data";
import { Stat } from "./util";

/** Firing rates of example motor cortex neurons for eight of the 108 reach conditions. */
export function ReachPSTH() {
  const d = useChurchland();
  const [k, setK] = useState(0);
  if (!d) return <div className="h-64 animate-pulse rounded-lg bg-surface-2" aria-label="Loading data" />;
  const ids = Object.keys(d.psth), curves = d.psth[ids[k]], t = d.times;
  const top = Math.max(...curves.flat()) * 1.1;
  const W = 360, H = 200, X = (ms: number) => 34 + ((ms - t[0]) / (t[t.length - 1] - t[0])) * (W - 44), Y = (v: number) => H - 24 - (v / top) * (H - 36);
  const peakT = t[curves.map((c) => c.indexOf(Math.max(...c))).sort((a, b) => a - b)[4]];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Firing rate of one neuron over time for eight reach conditions">
        <line x1="34" x2={W - 10} y1={H - 24} y2={H - 24} stroke="var(--line)" />
        <line x1={X(0)} x2={X(0)} y1="10" y2={H - 24} stroke="var(--warn)" strokeDasharray="3 3" />
        {curves.map((c, i) => <polyline key={i} points={c.map((v, j) => `${X(t[j])},${Y(v)}`).join(" ")} fill="none" stroke={`hsl(${i * 45} 65% 55%)`} strokeWidth="1.8" />)}
        {[0, 200, 400].map((ms) => <text key={ms} x={X(ms)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{ms} ms</text>)}
        {[0, Math.round(top / 2.2), Math.round(top / 1.1)].map((v) => <text key={v} x="30" y={Y(v) + 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">{v}</text>)}
        <text x={X(0) + 4} y="20" fontSize="10" fill="var(--warn)">movement onset</text>
        <text x={W - 12} y="20" fontSize="10" textAnchor="end" fill="var(--ink-3)">spikes/s</text>
      </svg>
      <label className="block text-sm"><span className="text-ink-2">Neuron</span>
        <select className="input mt-1" value={k} onChange={(e) => setK(Number(e.target.value))}>
          {ids.map((id, i) => <option key={id} value={i}>Unit {Number(id) + 1} of 218</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak rate (any condition)" value={`${Math.max(...curves.flat()).toFixed(0)} spikes/s`} />
        <Stat label="typical peak time" value={`${peakT} ms`} />
      </div>
      <p className="text-sm text-ink-2">Each line is one reach condition, averaged over many trials. The neurons are complicated: rates rise before the movement starts, peak at different times for different conditions, and often rise and fall more than once. Single neurons do not look like clean tuning curves; the order may only appear at the level of the population.</p>
    </div>
  );
}
