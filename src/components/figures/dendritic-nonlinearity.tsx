"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

function branchResponse(n: number) {
  const B = (V: number) => 1 / (1 + (1 / 3.57) * Math.exp(-0.062 * V));
  let V = -70; const dt = 0.05;
  for (let k = 0; k < 4000; k++) V += (dt * (-10 * (V + 70) - n * 0.2 * V - n * 3 * B(V) * V)) / 30;
  return V + 70;
}

/** Four dendritic branches with NMDA-like steady-state responses; active synapses either clustered on one branch or spread evenly; each branch's depolarisation reaches the soma attenuated by 0.3. */
export function DendriticNonlinearity() {
  const [k, setK] = useState(12);
  const [clustered, setClustered] = useState(true);
  const table = useMemo(() => Array.from({ length: 21 }, (_, n) => branchResponse(n)), []);
  const f = (n: number) => { const i = Math.floor(n), t = n - i; return i >= 20 ? table[20] : table[i] * (1 - t) + table[i + 1] * t; };
  const counts = clustered ? [k, 0, 0, 0] : [k / 4, k / 4, k / 4, k / 4];
  const branch = counts.map(f), soma = 0.3 * branch.reduce((a, b) => a + b, 0);
  const linear = 0.3 * k * table[1];
  const W = 360, H = 200, bx = 30, bw = 50, base = 170;
  const scale = 130 / 60;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${clustered ? "btn-primary" : ""}`} onClick={() => setClustered(true)}>clustered on one branch</button>
        <button className={`btn !py-1.5 ${!clustered ? "btn-primary" : ""}`} onClick={() => setClustered(false)}>spread over four</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Branch and somatic depolarisations for clustered or dispersed synapses">
        {branch.map((v, i) => (
          <g key={i}>
            <rect x={bx + i * (bw + 12)} y={base - v * scale} width={bw} height={v * scale} rx="4" fill="var(--neuro)" opacity="0.8" />
            <text x={bx + i * (bw + 12) + bw / 2} y={base + 12} fontSize="9" textAnchor="middle" fill="var(--ink-3)">branch {i + 1}</text>
            <text x={bx + i * (bw + 12) + bw / 2} y={base - v * scale - 4} fontSize="9" textAnchor="middle" fill="var(--ink-2)">{counts[i] % 1 ? counts[i].toFixed(1) : counts[i]} syn</text>
          </g>
        ))}
        <rect x={bx + 4 * (bw + 12)} y={base - soma * scale} width={bw} height={soma * scale} rx="4" fill="var(--ai)" />
        <text x={bx + 4 * (bw + 12) + bw / 2} y={base + 12} fontSize="9" textAnchor="middle" fill="var(--ai)">soma</text>
        <line x1={bx + 4 * (bw + 12) - 4} x2={bx + 4 * (bw + 12) + bw + 4} y1={base - linear * scale} y2={base - linear * scale} stroke="var(--warn)" strokeDasharray="3 3" />
        <text x={bx + 4 * (bw + 12) - 8} y={base - linear * scale + 3} fontSize="8" textAnchor="end" fill="var(--warn)">linear sum</text>
        <line x1={bx - 6} x2={W - 4} y1={base} y2={base} stroke="var(--line)" />
      </svg>
      <Slider label="active synapses" value={k} min={0} max={20} step={1} onChange={setK} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="somatic depolarisation" value={`${soma.toFixed(1)} mV`} />
        <Stat label="if every synapse added linearly" value={`${linear.toFixed(1)} mV`} />
      </div>
      <p className="text-sm text-ink-2">Each branch's depolarisation (in mV) is the steady response of a compartment with NMDA and AMPA synapses, and grows in an S-shape with the number of its active synapses. A few synapses spread over four branches stay in the shallow foot of the curve; the same synapses clustered on one branch push it into its steep middle. Near 20 synapses the clustered branch saturates and spreading catches up.</p>
    </div>
  );
}
