"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A quadratic surface set by its Hessian's eigenvalues and orientation, with a gradient descent path. */
export function HessianSurface() {
  const [l1, setL1] = useState(2);
  const [l2, setL2] = useState(0.3);
  const [ang, setAng] = useState(30);
  const [lr, setLr] = useState(0.3);
  const th = (ang * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  const H = [[l1 * c * c + l2 * s * s, (l1 - l2) * c * s], [(l1 - l2) * c * s, l1 * s * s + l2 * c * c]];
  const f = (x: number, y: number) => 0.5 * (H[0][0] * x * x + 2 * H[0][1] * x * y + H[1][1] * y * y);
  const W = 320, C = W / 2, K = 50, n = 40;
  const P = (x: number, y: number) => [C + x * K, C - y * K];
  const vals: number[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) vals.push(f(-3.2 + (j + 0.5) * 6.4 / n, 3.2 - (i + 0.5) * 6.4 / n));
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const path: number[][] = [[2.6, 1.6]];
  for (let k = 0; k < 40; k++) {
    const [x, y] = path[path.length - 1];
    const gx = H[0][0] * x + H[0][1] * y, gy = H[1][0] * x + H[1][1] * y;
    const nx = x - lr * gx, ny = y - lr * gy;
    if (Math.abs(nx) > 6 || Math.abs(ny) > 6) break;
    path.push([nx, ny]);
  }
  const kind = l1 > 0 && l2 > 0 ? "minimum (bowl)" : l1 < 0 && l2 < 0 ? "maximum (dome)" : l1 * l2 < 0 ? "saddle" : "flat direction (degenerate)";
  const cond = Math.max(Math.abs(l1), Math.abs(l2)) / Math.max(1e-6, Math.min(Math.abs(l1), Math.abs(l2)));
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="A quadratic surface and a gradient descent path">
        <defs><clipPath id="hsc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#hsc)">
          {vals.map((v, k) => { const t = (v - lo) / (hi - lo || 1); const band = Math.floor(t * 12) / 12; return <rect key={k} x={(k % n) * (W / n)} y={Math.floor(k / n) * (W / n)} width={W / n + 1} height={W / n + 1} shapeRendering="crispEdges" fill="var(--accent)" opacity={0.06 + 0.6 * (1 - band)} />; })}
          {[[c, s, l1], [-s, c, l2]].map(([u, v, l], i) => <line key={i} x1={P(-3.5 * u, -3.5 * v)[0]} y1={P(-3.5 * u, -3.5 * v)[1]} x2={P(3.5 * u, 3.5 * v)[0]} y2={P(3.5 * u, 3.5 * v)[1]} stroke={l > 0 ? "var(--good)" : "var(--bad)"} strokeDasharray="5 4" />)}
          <polyline points={path.map(([x, y]) => P(x, y).join(",")).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
          {path.map(([x, y], i) => <circle key={i} cx={P(x, y)[0]} cy={P(x, y)[1]} r="2.5" fill="var(--neuro)" />)}
        </g>
      </svg>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Slider label="eigenvalue λ₁" value={l1} min={-2} max={3} step={0.05} onChange={setL1} fmt={(v) => v.toFixed(2)} />
          <Slider label="eigenvalue λ₂" value={l2} min={-2} max={3} step={0.05} onChange={setL2} fmt={(v) => v.toFixed(2)} />
          <Slider label="orientation" value={ang} min={0} max={180} step={1} onChange={setAng} unit="°" />
          <Slider label="learning rate η" value={lr} min={0.02} max={1.2} step={0.01} onChange={setLr} fmt={(v) => v.toFixed(2)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="critical point at the origin is a" value={kind} />
          <Stat label="condition number |λ|max / |λ|min" value={cond > 999 ? "∞" : cond.toFixed(1)} />
          <Stat label="Hessian" value={`[${H[0][0].toFixed(2)} ${H[0][1].toFixed(2)}; ${H[1][0].toFixed(2)} ${H[1][1].toFixed(2)}]`} />
          <Stat label="stable if η below 2 / λmax" value={(2 / Math.max(l1, l2, 1e-6)).toFixed(2)} />
        </div>
        <p className="text-sm text-ink-2">The surface is f(w) = ½ wᵀHw. Dashed lines are the Hessian's eigenvectors (green: curving up, red: curving down). Pink dots are gradient descent from the same start. With very different eigenvalues the path zigzags across the steep direction and crawls along the shallow one; push η above 2/λmax and it diverges; make one eigenvalue negative and the path escapes along it: a saddle.</p>
      </div>
    </div>
  );
}
