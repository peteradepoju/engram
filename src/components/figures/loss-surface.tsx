"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The squared-error surface of a two-weight linear neuron; correlated inputs stretch the bowl. */
export function LossSurface() {
  const [rho, setRho] = useState(0.8);
  const [lam, setLam] = useState(0);
  const [lr, setLr] = useState(0.4);
  const data = useMemo(() => {
    const r = rng(9), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 80 }, () => [g(), g(), g()]);
  }, []);
  const { A, b } = useMemo(() => {
    const X = data.map(([u, v]) => [u, rho * u + Math.sqrt(1 - rho * rho) * v]);
    const y = X.map(([x1, x2], i) => 1.0 * x1 + 0.5 * x2 + 0.3 * data[i][2]);
    const T = X.length, A = [[0, 0], [0, 0]], b = [0, 0];
    X.forEach(([x1, x2], i) => { A[0][0] += x1 * x1 / T; A[0][1] += x1 * x2 / T; A[1][1] += x2 * x2 / T; b[0] += x1 * y[i] / T; b[1] += x2 * y[i] / T; });
    A[1][0] = A[0][1];
    return { A, b };
  }, [data, rho]);
  const Hm = [[A[0][0] + lam, A[0][1]], [A[1][0], A[1][1] + lam]];
  const det = Hm[0][0] * Hm[1][1] - Hm[0][1] * Hm[1][0];
  const wStar = [(Hm[1][1] * b[0] - Hm[0][1] * b[1]) / det, (-Hm[1][0] * b[0] + Hm[0][0] * b[1]) / det];
  const L = (w1: number, w2: number) => 0.5 * (Hm[0][0] * w1 * w1 + 2 * Hm[0][1] * w1 * w2 + Hm[1][1] * w2 * w2) - (b[0] * w1 + b[1] * w2);
  const W = 320, C = W / 2, K = 55, n = 40, cx = 0.6, cy = 0.4;
  const P = (w1: number, w2: number) => [C + (w1 - cx) * K, C - (w2 - cy) * K];
  const vals: number[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) vals.push(L(cx - 2.9 + (j + 0.5) * 5.8 / n, cy + 2.9 - (i + 0.5) * 5.8 / n));
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const path: number[][] = [[-1.8, 2.6]];
  for (let k = 0; k < 60; k++) {
    const [w1, w2] = path[path.length - 1];
    const g1 = Hm[0][0] * w1 + Hm[0][1] * w2 - b[0], g2 = Hm[1][0] * w1 + Hm[1][1] * w2 - b[1];
    const nw = [w1 - lr * g1, w2 - lr * g2];
    if (Math.abs(nw[0]) > 8 || Math.abs(nw[1]) > 8) break;
    path.push(nw);
  }
  const tr = Hm[0][0] + Hm[1][1], disc = Math.sqrt(Math.max(tr * tr / 4 - det, 0));
  const e1 = tr / 2 + disc, e2 = tr / 2 - disc;
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Squared-error surface of a linear neuron">
        <defs><clipPath id="lsc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#lsc)">
          {vals.map((v, k) => { const t = Math.sqrt((v - lo) / (hi - lo || 1)); const band = Math.floor(t * 12) / 12; return <rect key={k} x={(k % n) * (W / n)} y={Math.floor(k / n) * (W / n)} width={W / n + 1} height={W / n + 1} shapeRendering="crispEdges" fill="var(--accent)" opacity={0.06 + 0.6 * (1 - band)} />; })}
          <polyline points={path.map(([a, c]) => P(a, c).join(",")).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
          {path.map(([a, c], i) => <circle key={i} cx={P(a, c)[0]} cy={P(a, c)[1]} r="2.5" fill="var(--neuro)" />)}
          <circle cx={P(wStar[0], wStar[1])[0]} cy={P(wStar[0], wStar[1])[1]} r="6" fill="none" stroke="var(--good)" strokeWidth="2.5" />
        </g>
        <text x={W - 8} y={W - 8} fontSize="10" textAnchor="end" fill="var(--ink-3)">weight w₁</text>
        <text x="8" y="14" fontSize="10" fill="var(--ink-3)">weight w₂</text>
      </svg>
      <div className="space-y-3">
        <Slider label="correlation between the two inputs ρ" value={rho} min={0} max={0.98} step={0.01} onChange={setRho} fmt={(v) => v.toFixed(2)} />
        <Slider label="ridge penalty λ" value={lam} min={0} max={1} step={0.01} onChange={setLam} fmt={(v) => v.toFixed(2)} />
        <Slider label="learning rate η" value={lr} min={0.05} max={1.5} step={0.01} onChange={setLr} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="closed form w* (green ring)" value={`(${wStar[0].toFixed(2)}, ${wStar[1].toFixed(2)})`} />
          <Stat label="Hessian eigenvalues" value={`${e1.toFixed(2)}, ${e2.toFixed(2)}`} />
        </div>
        <p className="text-sm text-ink-2">The loss of a linear neuron, ½ wᵀ(XᵀX/T + λI)w − wᵀXᵀy/T, is a bowl whose Hessian is XᵀX/T + λI. Setting its gradient to zero gives the green ring directly (the normal equations, or ridge). Pink dots are gradient descent. Correlated inputs stretch the bowl into a long valley, where descent crawls; the ridge penalty rounds it off and pulls the minimum towards the origin.</p>
      </div>
    </div>
  );
}
