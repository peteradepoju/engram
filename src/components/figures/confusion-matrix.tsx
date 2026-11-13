"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A schematic model recovery confusion matrix that sharpens with trial count and depends on design. */
export function ConfusionMatrix() {
  const [T, setT] = useState(200);
  const [rev, setRev] = useState(true);
  const names = ["Q-learning", "win-stay lose-shift", "biased random"];
  const sharp = 1 - Math.exp(-T / (rev ? 60 : 180));
  const conf = [
    [0.34 + 0.66 * sharp, 0.06 * (1 - sharp), 0.6 * (1 - sharp) + (rev ? 0 : 0.12 * sharp)],
    [0.1 * (1 - sharp), 0.5 + 0.5 * sharp, 0.4 * (1 - sharp)],
    [0.1 * (1 - sharp), 0.35 * (1 - sharp) + 0.05, 0.55 + 0.4 * sharp - 0.05],
  ].map((row) => { const s = row.reduce((a, b) => a + b, 0); return row.map((v) => v / s); });
  const c = 70;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 260" className="mx-auto w-full max-w-[420px] rounded-lg bg-surface-2" role="img" aria-label="Model recovery confusion matrix">
        {conf.map((row, i) => row.map((v, j) => (
          <g key={`${i}-${j}`}>
            <rect x={100 + j * c} y={40 + i * c} width={c - 3} height={c - 3} rx="4" fill="var(--ai)" opacity={0.08 + 0.92 * v} />
            <text x={100 + j * c + c / 2 - 1} y={40 + i * c + c / 2 + 4} fontSize="12" textAnchor="middle" fill="var(--ink)">{v.toFixed(2)}</text>
          </g>
        )))}
        {names.map((nm, i) => <text key={`r${i}`} x="95" y={40 + i * c + c / 2 + 3} fontSize="8" textAnchor="end" fill="var(--ink-2)">{nm}</text>)}
        {names.map((nm, j) => <text key={`c${j}`} x={100 + j * c + c / 2} y="34" fontSize="8" textAnchor="middle" fill="var(--ink-2)">{nm}</text>)}
        <text x="100" y="16" fontSize="8" fill="var(--ink-3)">selected model →</text>
        <text x="10" y="250" fontSize="8" fill="var(--ink-3)">rows: model that generated the data</text>
      </svg>
      <Slider label="trials per participant" value={T} min={20} max={600} step={10} onChange={setT} />
      <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={rev} onChange={(e) => setRev(e.target.checked)} /> include a reversal halfway</label>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean diagonal (recovery)" value={((conf[0][0] + conf[1][1] + conf[2][2]) / 3).toFixed(2)} />
        <Stat label="learners mistaken for biased" value={conf[0][2].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">A schematic summary of the lesson&apos;s simulations, not a live fit. More trials sharpen the diagonal. Without a reversal, fast learners settle on one arm and look like biased choosers, which recovery reveals.</p>
    </div>
  );
}
