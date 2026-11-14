"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, solve, Stat } from "./util";

/** Logistic regression on two classes in two dimensions, fitted by Newton's method with an L2 penalty. */
export function LogisticBoundary() {
  const [sep, setSep] = useState(1.2);
  const [logLam, setLogLam] = useState(-1);
  const pts = useMemo(() => {
    const r = rng(561);
    return Array.from({ length: 60 }, (_, i): [number, number, number] => { const c = i % 2; return [gauss(r) * 0.7 + (c ? sep : -sep) * 0.6, gauss(r) * 0.7 + (c ? sep : -sep) * 0.4, c]; });
  }, [sep]);
  const lam = Math.pow(10, logLam);
  let w = [0, 0, 0];
  for (let it = 0; it < 40; it++) {
    const g = [0, 0, 0], H = [[lam * 0 + 1e-6, 0, 0], [0, lam, 0], [0, 0, lam]];
    for (const [x1, x2, y] of pts) {
      const x = [1, x1, x2], p = 1 / (1 + Math.exp(-(w[0] + w[1] * x1 + w[2] * x2)));
      for (let a = 0; a < 3; a++) { g[a] += (y - p) * x[a]; for (let b = 0; b < 3; b++) H[a][b] += p * (1 - p) * x[a] * x[b]; }
    }
    g[1] -= lam * w[1]; g[2] -= lam * w[2];
    const step = solve(H, g);
    w = w.map((v, i) => v + step[i]);
    if (Math.hypot(w[1], w[2]) > 200) break;
  }
  const norm = Math.hypot(w[1], w[2]);
  const errs = pts.filter(([x1, x2, y]) => (w[0] + w[1] * x1 + w[2] * x2 > 0 ? 1 : 0) !== y).length;
  const sx = (v: number): number => 170 + v * 45, sy = (v: number): number => 95 - v * 45;
  const lineAt = (level: number): string => {
    const z = Math.log(level / (1 - level));
    if (Math.abs(w[2]) < 1e-9) return "";
    const ys = (x: number): number => (z - w[0] - w[1] * x) / w[2];
    return `${sx(-4)},${sy(ys(-4))} ${sx(4)},${sy(ys(4))}`;
  };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 190" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Logistic regression decision boundary">
        <defs><clipPath id="lbclip"><rect x="0" y="0" width="340" height="190" /></clipPath></defs>
        <g clipPath="url(#lbclip)">
          {[0.1, 0.9].map((l) => <polyline key={l} points={lineAt(l)} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />)}
          <polyline points={lineAt(0.5)} fill="none" stroke="var(--ink)" strokeWidth="1.8" />
          {pts.map(([x1, x2, y], i) => <circle key={i} cx={sx(x1)} cy={sy(x2)} r="3" fill={y ? "var(--neuro)" : "var(--ai)"} />)}
        </g>
        <text x="8" y="14" fontSize="8" fill="var(--ink-3)">solid: P = 0.5; dashed: P = 0.1 and 0.9</text>
      </svg>
      <Slider label="class separation" value={sep} min={0.2} max={3} step={0.1} onChange={setSep} fmt={(v) => v.toFixed(1)} />
      <Slider label="log₁₀ penalty λ" value={logLam} min={-6} max={2} step={0.1} onChange={setLogLam} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="weight length ‖w‖" value={norm > 199 ? "diverging" : norm.toFixed(2)} />
        <Stat label="training errors (of 60)" value={String(errs)} />
      </div>
      <p className="text-sm text-ink-2">The dashed lines show where the model is 90% sure. When the classes overlap they lie far apart. Separate the classes completely and remove the penalty: the weights grow without limit and the lines collapse onto the boundary, because the model can always be more certain without making any error.</p>
    </div>
  );
}
