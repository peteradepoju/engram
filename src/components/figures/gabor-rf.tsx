"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const N = 28;

/** A Gabor receptive field drawn as a heat map, and its orientation tuning to drifting gratings (mean over 8 phases of the rectified dot product). */
export function GaborRF() {
  const [theta, setTheta] = useState(30);
  const [f, setF] = useState(1);
  const [phase, setPhase] = useState(0);
  const [sy, setSy] = useState(0.6);
  const { rf, tuning } = useMemo(() => {
    const xy = Array.from({ length: N }, (_, i) => (i - N / 2) * (4 / N));
    const t = (theta * Math.PI) / 180, rf: number[][] = [];
    for (const y of xy) rf.push(xy.map((x) => { const xr = x * Math.cos(t) + y * Math.sin(t), yr = -x * Math.sin(t) + y * Math.cos(t); return Math.exp(-(xr * xr) / (2 * 0.16) - (yr * yr) / (2 * sy * sy)) * Math.cos(2 * Math.PI * f * xr + (phase * Math.PI) / 180); }));
    const tuning = Array.from({ length: 36 }, (_, k) => {
      const o = (k * 5 * Math.PI) / 180; let s = 0;
      for (let p = 0; p < 8; p++) {
        let d = 0; const ph = (p * Math.PI) / 4;
        xy.forEach((y, i) => xy.forEach((x, j) => { d += rf[i][j] * Math.cos(2 * Math.PI * f * (x * Math.cos(o) + y * Math.sin(o)) + ph); }));
        s += Math.max(0, d);
      }
      return s / 8;
    });
    return { rf, tuning };
  }, [theta, f, phase, sy]);
  const tmax = Math.max(...tuning, 1e-9), c = 150 / N;
  const col = (v: number) => v >= 0 ? `rgba(220,80,60,${Math.min(1, v)})` : `rgba(60,110,210,${Math.min(1, -v)})`;
  const half = tuning.filter((v) => v >= tmax / 2).length * 5;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Gabor receptive field and orientation tuning">
        {rf.map((row, i) => row.map((v, j) => <rect key={`${i}-${j}`} x={10 + j * c} y={15 + (N - 1 - i) * c} width={c + 0.3} height={c + 0.3} fill={col(v)} />))}
        <text x="10" y="11" fontSize="9" fill="var(--ink-3)">receptive field (red ON, blue OFF)</text>
        <text x="180" y="11" fontSize="9" fill="var(--ink-3)">response against grating orientation</text>
        <line x1="180" x2="350" y1="165" y2="165" stroke="var(--line)" />
        <polyline points={tuning.map((v, k) => `${180 + (k / 35) * 170},${165 - (v / tmax) * 140}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="180" y="177" fontSize="8" fill="var(--ink-3)">0°</text><text x="350" y="177" fontSize="8" textAnchor="end" fill="var(--ink-3)">175°</text>
      </svg>
      <Slider label="preferred orientation θ" value={theta} min={0} max={175} step={5} onChange={setTheta} unit="°" />
      <Slider label="spatial frequency" value={f} min={0.5} max={2} step={0.05} onChange={setF} unit="c/deg" fmt={(v) => v.toFixed(2)} />
      <Slider label="phase" value={phase} min={0} max={180} step={15} onChange={setPhase} unit="°" />
      <Slider label="envelope length along the stripes" value={sy} min={0.2} max={1.2} step={0.05} onChange={setSy} unit="°" fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak at" value={`${tuning.indexOf(tmax) * 5}°`} />
        <Stat label="width above half maximum" value={`about ${half}°`} />
      </div>
      <p className="text-sm text-ink-2">Phase changes the pattern of ON and OFF bands, from a central band with flanks (0°) to two bands side by side (90°), but not the orientation tuning to drifting gratings, which average over phase. A longer envelope along the stripes sums over a longer line and sharpens orientation tuning; a shorter one broadens it.</p>
    </div>
  );
}
