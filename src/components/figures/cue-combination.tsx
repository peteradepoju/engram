"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Ernst and Banks's cue combination: two Gaussian cues combine into an estimate weighted by their reliabilities. */
export function CueCombination() {
  const [sV, setSV] = useState(1);
  const [sH, setSH] = useState(2);
  const [conflict, setConflict] = useState(3);
  const muV = 55 - conflict / 2, muH = 55 + conflict / 2;
  const wV = (1 / sV ** 2) / (1 / sV ** 2 + 1 / sH ** 2);
  const mu = wV * muV + (1 - wV) * muH, s = Math.sqrt(1 / (1 / sV ** 2 + 1 / sH ** 2));
  const W = 360, H = 200, lo = 44, hi = 66;
  const X = (x: number) => 20 + ((x - lo) / (hi - lo)) * (W - 30);
  const g = (x: number, m: number, sd: number) => Math.exp(-((x - m) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
  const top = g(mu, mu, s) * 1.1;
  const Y = (v: number) => H - 26 - (v / top) * (H - 40);
  const curve = (m: number, sd: number) => Array.from({ length: 201 }, (_, i) => { const x = lo + (i / 200) * (hi - lo); return `${X(x)},${Y(g(x, m, sd))}`; }).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Visual, haptic and combined estimates of size">
        <polyline points={curve(muV, sV)} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={curve(muH, sH)} fill="none" stroke="var(--warn)" strokeWidth="2" />
        <polyline points={curve(mu, s)} fill="none" stroke="var(--neuro)" strokeWidth="3" />
        <line x1="20" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[45, 50, 55, 60, 65].map((x) => <text key={x} x={X(x)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{x} mm</text>)}
        <text x="24" y="16" fontSize="10" fill="var(--ai)">vision</text>
        <text x="24" y="29" fontSize="10" fill="var(--warn)">touch</text>
        <text x="24" y="42" fontSize="10" fill="var(--neuro)">combined</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="visual noise σV" value={sV} min={0.3} max={4} step={0.05} onChange={setSV} unit="mm" fmt={(v) => v.toFixed(2)} />
        <Slider label="touch noise σH" value={sH} min={0.3} max={4} step={0.05} onChange={setSH} unit="mm" fmt={(v) => v.toFixed(2)} />
        <Slider label="conflict between cues" value={conflict} min={-6} max={6} step={0.5} onChange={setConflict} unit="mm" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="weight on vision" value={wV.toFixed(2)} />
        <Stat label="combined estimate" value={`${mu.toFixed(1)} mm`} />
        <Stat label="combined σ" value={`${s.toFixed(2)} mm`} />
      </div>
      <p className="text-sm text-ink-2">An object&apos;s height is seen and felt. Each sense gives a noisy, Gaussian estimate. The best combination weights each cue by its reliability, one over its variance, so the combined estimate sits nearer the more reliable cue, and its spread is smaller than either cue&apos;s alone. Make vision noisier (as Ernst and Banks did by blurring the display) and the weight shifts to touch.</p>
    </div>
  );
}
