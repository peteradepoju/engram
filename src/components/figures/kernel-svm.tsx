"use client";

import React, { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** A Gaussian-kernel SVM on two interleaved classes, solved by dual coordinate ascent; C and the kernel width shape the boundary. */
export function KernelSvm() {
  const [logC, setLogC] = useState(0);
  const [logG, setLogG] = useState(0);
  const pts = useMemo(() => { const r = rng(574); return Array.from({ length: 70 }, (_, i): [number, number, number] => { const c = i % 2 ? 1 : -1; const a = Math.PI * r(); const x = c > 0 ? Math.cos(a) : 1 - Math.cos(a); const y = c > 0 ? Math.sin(a) - 0.2 : 0.2 - Math.sin(a); return [x + 0.15 * gauss(r) - 0.5, y + 0.15 * gauss(r), c]; }); }, []);
  const C = Math.pow(10, logC), gam = Math.pow(10, logG);
  const k = (a: number[], b: number[]): number => Math.exp(-gam * ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)) + 1;
  const { alpha, f } = useMemo(() => {
    const n = pts.length, K = pts.map((a) => pts.map((b) => k(a, b))), al = Array(n).fill(0), g = Array(n).fill(0);
    for (let sweep = 0; sweep < 60; sweep++) for (let i = 0; i < n; i++) {
      const yi = pts[i][2], grad = yi * g[i] - 1;
      const na = Math.min(Math.max(al[i] - grad / K[i][i], 0), C), d = na - al[i];
      if (d !== 0) { for (let j = 0; j < n; j++) g[j] += d * yi * K[i][j]; al[i] = na; }
    }
    const fx = (x: number, y: number): number => pts.reduce((s, p, i) => s + (al[i] ? al[i] * p[2] * k(p, [x, y]) : 0), 0);
    return { alpha: al, f: fx };
  }, [pts, C, gam]);
  const cells: React.ReactElement[] = [];
  for (let i = 0; i < 34; i++) for (let j = 0; j < 19; j++) {
    const x = -1.9 + i * 0.12, y = -1.2 + j * 0.13, v = f(x, y);
    cells.push(<rect key={`${i}-${j}`} x={10 + i * 10} y={180 - (j + 1) * 9.5} width="10" height="9.5" fill={v > 0 ? "var(--neuro)" : "var(--ai)"} opacity={Math.min(0.12 + 0.25 * Math.abs(v), 0.4)} />);
  }
  const sx = (v: number): number => 10 + (v + 1.9) * 83.3, sy = (v: number): number => 180 - (v + 1.2) * 73;
  const nsv = alpha.filter((a) => a > 1e-6).length;
  const errs = pts.filter((p) => Math.sign(f(p[0], p[1])) !== p[2]).length;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 350 185" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Kernel SVM decision regions">
        {cells}
        {pts.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={alpha[i] > 1e-6 ? 4.2 : 2.8} fill={p[2] > 0 ? "var(--neuro)" : "var(--ai)"} stroke={alpha[i] > 1e-6 ? "var(--ink)" : "none"} />)}
      </svg>
      <Slider label="log₁₀ C (cost of margin violations)" value={logC} min={-2} max={3} step={0.1} onChange={setLogC} fmt={(v) => v.toFixed(1)} />
      <Slider label="log₁₀ γ (kernel sharpness)" value={logG} min={-1} max={2} step={0.1} onChange={setLogG} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="support vectors (outlined)" value={`${nsv} of 70`} />
        <Stat label="training errors" value={String(errs)} />
      </div>
      <p className="text-sm text-ink-2">Only the outlined points, the support vectors, shape the boundary. Small C tolerates violations and gives a smooth boundary with many support vectors; large C with a sharp kernel bends the boundary around every point.</p>
    </div>
  );
}
