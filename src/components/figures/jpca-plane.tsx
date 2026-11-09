"use client";

import { useState } from "react";
import { condColour, useChurchland } from "./churchland-data";
import { Stat } from "./util";

/** The reaching data projected onto the plane of strongest rotation (jPCA), with a condition-shuffled control. */
export function JPCAPlane() {
  const d = useChurchland();
  const [shuf, setShuf] = useState(false);
  if (!d) return <div className="h-72 animate-pulse rounded-lg bg-surface-2" aria-label="Loading data" />;
  const J = shuf ? d.jpcaShuffled : d.jpca, all = J.flatMap((c) => [...c[0], ...c[1]]), m = Math.max(...all.map(Math.abs)) * 1.05;
  const W = 360, H = 300, X = (v: number) => W / 2 + (v / m) * (W / 2 - 14), Y = (v: number) => H / 2 - (v / m) * (H / 2 - 14);
  const starts = J.map((c) => c[0][0]), lo = Math.min(...starts), hi = Math.max(...starts);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Trajectories in the plane of strongest rotation">
        <line x1="10" x2={W - 10} y1={H / 2} y2={H / 2} stroke="var(--line)" />
        <line x1={W / 2} x2={W / 2} y1="10" y2={H - 10} stroke="var(--line)" />
        {J.map((c, i) => {
          const col = condColour((c[0][0] - lo) / (hi - lo)), n = c[0].length;
          return <g key={i}><polyline points={c[0].map((v, j) => `${X(v)},${Y(c[1][j])}`).join(" ")} fill="none" stroke={col} strokeWidth="1" opacity="0.8" />
            <circle cx={X(c[0][n - 1])} cy={Y(c[1][n - 1])} r="2" fill={col} /></g>;
        })}
        <text x={W - 12} y={H / 2 - 5} fontSize="10" textAnchor="end" fill="var(--ink-3)">jPC1</text>
        <text x={W / 2 + 5} y="20" fontSize="10" fill="var(--ink-3)">jPC2</text>
        <text x="14" y={H - 10} fontSize="10" fill="var(--ink-3)">{shuf ? "conditions shuffled per neuron" : "real data, −50 to 150 ms"}</text>
      </svg>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" checked={shuf} onChange={(e) => setShuf(e.target.checked)} className="accent-[var(--accent)]" />
        control: shuffle condition labels independently for each neuron
      </label>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="rotation model R²" value={(shuf ? d.r2SkewShuffled : d.r2Skew).toFixed(2)} />
        <Stat label="rotation frequency" value={`${d.rotationHz.toFixed(2)} Hz`} />
        <Stat label="end dots" value="150 ms" />
      </div>
      <p className="text-sm text-ink-2">Fit dZ/dt = MZ in the top six principal components with M constrained to be skew-symmetric (pure rotation), then project onto the plane of its fastest rotation. On the real data almost every condition swings round in the same direction, with a period of under a second. Shuffle the conditions independently for each neuron, which keeps every single-neuron response but breaks their coordination, and the rotations vanish.</p>
    </div>
  );
}
