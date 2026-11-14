"use client";

import React, { useState } from "react";
import { Slider, Stat } from "./util";

const K = 4;
const MU = Array.from({ length: K }, (_, k): [number, number] => [Math.cos((2 * Math.PI * k) / K + 0.4), Math.sin((2 * Math.PI * k) / K + 0.4)]);
const COLS = ["var(--neuro)", "var(--ai)", "var(--warn)", "var(--good)"];

/** Softmax regression with K classes: decision regions and the probability of each class at a chosen point. */
export function SoftmaxRegions() {
  const [beta, setBeta] = useState(2);
  const [px, setPx] = useState(0.3);
  const [py, setPy] = useState(0.1);
  const probs = (x: number, y: number): number[] => { const z = MU.map(([a, b]) => beta * (a * x + b * y)); const m = Math.max(...z); const e = z.map((v) => Math.exp(v - m)); const s = e.reduce((a, b) => a + b, 0); return e.map((v) => v / s); };
  const cells: React.ReactElement[] = [];
  for (let i = 0; i < 34; i++) for (let j = 0; j < 19; j++) {
    const x = -1.7 + i * 0.1, y = -0.9 + j * 0.1, p = probs(x, y), k = p.indexOf(Math.max(...p));
    cells.push(<rect key={`${i}-${j}`} x={10 + i * 10} y={180 - (j + 1) * 9.5} width="10" height="9.5" fill={COLS[k]} opacity={0.15 + 0.6 * (p[k] - 1 / K) / (1 - 1 / K)} />);
  }
  const p = probs(px, py);
  const sx = (v: number): number => 10 + (v + 1.7) * 100, sy = (v: number): number => 180 - (v + 0.9) * 95;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 350 185" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Softmax decision regions">
        {cells}
        {MU.map(([a, b], k) => <circle key={k} cx={sx(a * 0.8)} cy={sy(b * 0.8)} r="4" fill={COLS[k]} stroke="var(--ink)" />)}
        <circle cx={sx(px)} cy={sy(py)} r="5" fill="none" stroke="var(--ink)" strokeWidth="2" />
      </svg>
      <Slider label="weight scale β (confidence)" value={beta} min={0.2} max={10} step={0.1} onChange={setBeta} fmt={(v) => v.toFixed(1)} />
      <Slider label="test point x" value={px} min={-1.6} max={1.6} step={0.05} onChange={setPx} fmt={(v) => v.toFixed(2)} />
      <Slider label="test point y" value={py} min={-0.85} max={0.85} step={0.05} onChange={setPy} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-4 gap-2">{p.map((v, k) => <Stat key={k} label={`P(class ${k + 1})`} value={v.toFixed(2)} />)}</div>
      <p className="text-sm text-ink-2">Each class has a weight vector (dots); the class with the largest score wins, so the regions are bounded by straight lines. Scaling all the weights up does not move the boundaries but makes every prediction more confident: shading shows the winning probability.</p>
    </div>
  );
}
