"use client";

import React, { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** The Gaussian kernel matrix of trials from three conditions: too narrow and every trial is unique, too wide and all are alike. */
export function KernelWidth() {
  const [logG, setLogG] = useState(-1);
  const X = useMemo(() => {
    const r = rng(575), means = [[0, 0, 0, 0], [2, 1, 0, -1], [0, 2, -2, 1]];
    return Array.from({ length: 36 }, (_, i): number[] => means[Math.floor(i / 12)].map((m) => m + gauss(r)));
  }, []);
  const g = Math.pow(10, logG);
  const K = X.map((a) => X.map((b) => Math.exp(-g * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))));
  let within = 0, between = 0, nw = 0, nb = 0;
  K.forEach((row, i) => row.forEach((v, j) => { if (i === j) return; if (Math.floor(i / 12) === Math.floor(j / 12)) { within += v; nw++; } else { between += v; nb++; } }));
  const cells: React.ReactElement[] = [];
  K.forEach((row, i) => row.forEach((v, j) => cells.push(<rect key={`${i}-${j}`} x={60 + j * 6} y={5 + i * 6} width="6" height="6" fill="var(--neuro)" opacity={v} />)));
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 225" className="mx-auto w-full max-w-[400px] rounded-lg bg-surface-2" role="img" aria-label="Kernel matrix">
        {cells}
        {[1, 2].map((b) => <g key={b}><line x1={60 + b * 72} x2={60 + b * 72} y1="5" y2="221" stroke="var(--line)" /><line x1="60" x2="276" y1={5 + b * 72} y2={5 + b * 72} stroke="var(--line)" /></g>)}
        <text x="56" y="45" fontSize="8" textAnchor="end" fill="var(--ink-3)">cond. 1</text>
        <text x="56" y="117" fontSize="8" textAnchor="end" fill="var(--ink-3)">cond. 2</text>
        <text x="56" y="189" fontSize="8" textAnchor="end" fill="var(--ink-3)">cond. 3</text>
      </svg>
      <Slider label="log₁₀ γ" value={logG} min={-3} max={1} step={0.05} onChange={setLogG} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean similarity within conditions" value={(within / nw).toFixed(3)} />
        <Stat label="mean similarity between conditions" value={(between / nb).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each square is the kernel similarity of two trials of a four-neuron population, with trials grouped by condition. With γ too large the matrix is nearly the identity: every trial looks unlike every other, and a kernel method can only memorise. With γ too small everything looks alike. In between, the block structure of the conditions appears.</p>
    </div>
  );
}
