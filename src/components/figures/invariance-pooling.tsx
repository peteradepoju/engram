"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const N = 32;

/** One-dimensional illustration of S and C layers: S1 units tuned to a bar at each position, and C1 units taking the maximum over pools of neighbouring S1 units. */
export function InvariancePooling() {
  const [pos, setPos] = useState(12);
  const [pool, setPool] = useState(4);
  const s1 = Array.from({ length: N }, (_, i) => Math.exp(-((i - pos) ** 2) / 2));
  const nC = Math.ceil(N / pool);
  const c1 = Array.from({ length: nC }, (_, k) => Math.max(...s1.slice(k * pool, (k + 1) * pool)));
  const shifted = Array.from({ length: N }, (_, i) => Math.exp(-((i - pos - 1) ** 2) / 2));
  const c1s = Array.from({ length: nC }, (_, k) => Math.max(...shifted.slice(k * pool, (k + 1) * pool)));
  const cos = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0) / Math.sqrt(a.reduce((s, v) => s + v * v, 0) * b.reduce((s, v) => s + v * v, 0));
  const W = 360, bw = 330 / N;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 200`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="S1 and C1 responses to a bar">
        <text x="12" y="14" fontSize="9" fill="var(--ink-3)">stimulus position</text>
        <rect x={15 + pos * bw} y="20" width={bw} height="14" fill="var(--ink)" />
        <text x="12" y="52" fontSize="9" fill="var(--ink-3)">S1 units (one per position)</text>
        {s1.map((v, i) => <rect key={i} x={15 + i * bw} y={100 - v * 40} width={bw - 1} height={v * 40 + 0.5} fill="var(--ai)" />)}
        <text x="12" y="120" fontSize="9" fill="var(--ink-3)">C1 units (max over {pool} S1 units)</text>
        {c1.map((v, k) => <rect key={k} x={15 + k * pool * bw} y={190 - v * 50} width={pool * bw - 2} height={v * 50 + 0.5} fill="var(--neuro)" />)}
      </svg>
      <Slider label="bar position" value={pos} min={0} max={N - 1} step={1} onChange={setPos} />
      <Slider label="pool size" value={pool} min={1} max={16} step={1} onChange={setPool} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="S1 similarity after a 1-step shift" value={cos(s1, shifted).toFixed(2)} />
        <Stat label="C1 similarity" value={cos(c1, c1s).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Each S1 unit responds only when the bar is near its own position, so a small shift changes the whole pattern. A C1 unit responds if the bar is anywhere in its pool, so its output barely changes until the bar crosses into the next pool. Bigger pools give more tolerance, and also more uncertainty about where the bar is: with a pool of 16, the C1 layer can only say left half or right half.</p>
    </div>
  );
}
