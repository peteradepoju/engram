"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** One 2 × 2 matrix seen four ways: as a map of the unit circle, by its singular vectors, by its eigenvectors, and as the dynamics ẋ = Ax. */
export function MatrixFourWays() {
  const [a, setA] = useState(1.2), [b, setB] = useState(0.8), [c, setC] = useState(-0.6), [d, setD] = useState(0.4);
  const T = a + d, D = a * d - b * c, disc = T * T / 4 - D;
  // singular values from AᵀA
  const p = a * a + c * c, q = a * b + c * d, r = b * b + d * d, m = (p + r) / 2, s = Math.sqrt(((p - r) / 2) ** 2 + q * q);
  const s1 = Math.sqrt(m + s), s2 = Math.sqrt(Math.max(0, m - s));
  const th = 0.5 * Math.atan2(2 * q, p - r);                     // right singular direction
  const u1 = [a * Math.cos(th) + b * Math.sin(th), c * Math.cos(th) + d * Math.sin(th)].map((v) => v / s1);
  const eigs: number[][] = disc >= 0 ? [T / 2 + Math.sqrt(disc), T / 2 - Math.sqrt(disc)].map((l) => (Math.abs(b) > 1e-9 ? [b, l - a] : Math.abs(c) > 1e-9 ? [l - d, c] : l === a ? [1, 0] : [0, 1])) : [];
  const W = 360, H = 190, L = { cx: 90, cy: 95, k: 32 }, R = { cx: 270, cy: 95, k: 32 };
  const circ = Array.from({ length: 65 }, (_, i) => { const t = (i / 64) * 2 * Math.PI; return [Math.cos(t), Math.sin(t)]; });
  const P = (o: typeof L, x: number, y: number) => `${o.cx + o.k * x},${o.cy - o.k * y}`;
  const trajs = [0, 1, 2, 3, 4, 5].map((k) => {
    const ang = (k / 6) * 2 * Math.PI; let x = 1.2 * Math.cos(ang), y = 1.2 * Math.sin(ang); const pts: string[] = [];
    for (let i = 0; i < 160; i++) { pts.push(P(R, x, y)); const dx = a * x + b * y, dy = c * x + d * y; x += 0.02 * dx; y += 0.02 * dy; if (Math.abs(x) > 2.6 || Math.abs(y) > 2.6) break; }
    return <polyline key={k} points={pts.join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.2" />;
  });
  const eigText = disc >= 0 ? `${(T / 2 + Math.sqrt(disc)).toFixed(2)}, ${(T / 2 - Math.sqrt(disc)).toFixed(2)}` : `${(T / 2).toFixed(2)} ± ${Math.sqrt(-disc).toFixed(2)}i`;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="A matrix as a map of the unit circle and as dynamics">
        <polyline points={circ.map(([x, y]) => P(L, x, y)).join(" ")} fill="none" stroke="var(--line)" strokeDasharray="3 3" />
        <polyline points={circ.map(([x, y]) => P(L, a * x + b * y, c * x + d * y)).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1={L.cx} y1={L.cy} x2={L.cx + L.k * s1 * u1[0]} y2={L.cy - L.k * s1 * u1[1]} stroke="var(--warn)" strokeWidth="2" />
        {eigs.map((v, i) => { const n = Math.hypot(v[0], v[1]) || 1; return <line key={i} x1={L.cx - 70 * v[0] / n} y1={L.cy + 70 * v[1] / n} x2={L.cx + 70 * v[0] / n} y2={L.cy - 70 * v[1] / n} stroke="var(--good)" strokeDasharray="4 3" />; })}
        <text x="8" y="14" fontSize="9" fill="var(--ai)">unit circle → ellipse</text>
        <text x="8" y="26" fontSize="9" fill="var(--warn)">largest stretch (σ₁)</text>
        <text x="8" y="38" fontSize="9" fill="var(--good)">eigenvector lines</text>
        <line x1="180" x2="180" y1="8" y2={H - 8} stroke="var(--line)" />
        {trajs}
        <circle cx={R.cx} cy={R.cy} r="3" fill="var(--ink)" />
        <text x="352" y="14" fontSize="9" textAnchor="end" fill="var(--neuro)">ẋ = Ax from six starts</text>
      </svg>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Slider label="a" value={a} min={-2} max={2} step={0.05} onChange={setA} />
        <Slider label="b" value={b} min={-2} max={2} step={0.05} onChange={setB} />
        <Slider label="c" value={c} min={-2} max={2} step={0.05} onChange={setC} />
        <Slider label="d" value={d} min={-2} max={2} step={0.05} onChange={setD} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="trace, det" value={`${T.toFixed(2)}, ${D.toFixed(2)}`} />
        <Stat label="eigenvalues" value={eigText} />
        <Stat label="singular values" value={`${s1.toFixed(2)}, ${s2.toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">The matrix [[a, b], [c, d]] maps the unit circle to an ellipse whose semi-axes are the singular values (Week 7); its area is |det| times the circle's (Week 5). Eigenvectors are the directions it only stretches (Week 6), and as dynamics ẋ = Ax their eigenvalues decide whether trajectories spiral, settle or escape (Weeks 21 and 22). Singular values and eigenvalues agree only for symmetric matrices: try b = c.</p>
    </div>
  );
}
