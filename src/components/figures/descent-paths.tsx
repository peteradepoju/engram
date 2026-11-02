"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const SURFS: Record<string, { f: (x: number, y: number) => number; g: (x: number, y: number) => [number, number]; start: [number, number]; L: number }> = {
  "long valley": { f: (x, y) => 0.5 * (x * x + 12 * y * y), g: (x, y) => [x, 12 * y], start: [-2.6, 0.9], L: 12 },
  Rosenbrock: { f: (x, y) => (1 - x) ** 2 + 5 * (y - x * x) ** 2, g: (x, y) => [-2 * (1 - x) - 20 * x * (y - x * x), 10 * (y - x * x)], start: [-1.5, 2.0], L: 50 },
};

/** Gradient descent paths in two dimensions, with the loss plotted against iteration. */
export function DescentPaths() {
  const [name, setName] = useState("long valley");
  const [frac, setFrac] = useState(0.8);
  const S = SURFS[name];
  const lr = (frac * 2) / S.L;
  const path: number[][] = [S.start];
  for (let k = 0; k < 200; k++) {
    const [x, y] = path[path.length - 1], [gx, gy] = S.g(x, y);
    const nx = x - lr * gx, ny = y - lr * gy;
    if (!Number.isFinite(nx) || Math.abs(nx) > 20 || Math.abs(ny) > 20) break;
    path.push([nx, ny]);
  }
  const W = 320, C = W / 2, K = name === "Rosenbrock" ? 70 : 52, cy = name === "Rosenbrock" ? 1.0 : 0;
  const P = (x: number, y: number) => [C + x * K, C - (y - cy) * K];
  const n = 36, vals: number[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) vals.push(S.f((j + 0.5 - n / 2) * (W / n) / K, cy + (n / 2 - i - 0.5) * (W / n) / K));
  const lv = vals.map((v) => Math.log10(v + 1e-3)), lo = Math.min(...lv), hi = Math.max(...lv);
  const losses = path.map(([x, y]) => S.f(x, y));
  const lx = (k: number) => 10 + (k / 200) * 200, ly = (v: number) => 10 + ((Math.log10(losses[0]) - Math.log10(Math.max(v, 1e-8))) / 9) * 120;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(SURFS).map((k) => <button key={k} className={`btn !py-1.5 ${name === k ? "btn-primary" : ""}`} onClick={() => setName(k)}>{k}</button>)}
      </div>
      <div className="grid gap-3 md:grid-cols-[320px_1fr]">
        <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Gradient descent path on a contour map">
          <defs><clipPath id="dpc"><rect width={W} height={W} /></clipPath></defs>
          <g clipPath="url(#dpc)">
            {vals.map((v, k) => { const b = Math.floor(((lv[k] - lo) / (hi - lo || 1)) * 12); return <rect key={k} x={(k % n) * (W / n)} y={Math.floor(k / n) * (W / n)} width={W / n + 1} height={W / n + 1} shapeRendering="crispEdges" fill="var(--accent)" opacity={0.08 + 0.6 * (1 - b / 12) + (b % 2 ? 0.1 : 0)} />; })}
            <polyline points={path.map(([x, y]) => P(x, y).join(",")).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
            {path.slice(0, 60).map(([x, y], i) => <circle key={i} cx={P(x, y)[0]} cy={P(x, y)[1]} r="2.2" fill="var(--neuro)" />)}
          </g>
        </svg>
        <div className="space-y-3">
          <svg viewBox="0 0 220 150" className="w-full rounded-lg bg-surface-2" role="img" aria-label="Loss against iteration">
            <polyline points={losses.map((v, k) => `${lx(k)},${Math.min(140, ly(v))}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" />
            <text x="12" y="146" fontSize="8" fill="var(--ink-3)">loss (log scale) over 200 iterations</text>
          </svg>
          <Slider label="learning rate, as a fraction of 2/L" value={frac} min={0.05} max={1.2} step={0.01} onChange={setFrac} fmt={(v) => v.toFixed(2)} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="learning rate η" value={lr.toFixed(4)} />
            <Stat label="loss after the last step" value={path.length < 201 ? "diverged" : losses[losses.length - 1].toExponential(2)} />
          </div>
          <p className="text-sm text-ink-2">L is the largest curvature of the surface (for the long valley, the steep direction). Gradient descent is stable only for η below 2/L, so the steep direction sets the step, and progress along the shallow floor is slow. Above 1.0 the path diverges. The Rosenbrock function's curved valley is a classic test: descent reaches the valley fast and then crawls along it.</p>
        </div>
      </div>
    </div>
  );
}
