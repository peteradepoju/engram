"use client";

import { useMemo, useState } from "react";
import { Arrow } from "./drag";
import { symEig } from "./linalg";
import { rng, Slider, Stat } from "./util";

/** Two neurons' correlated noise. The covariance matrix's eigenvectors are the axes of the cloud. */
export function CovEllipse() {
  const [s1, setS1] = useState(1.4), [s2, setS2] = useState(0.8), [rho, setRho] = useState(0.6);
  const z = useMemo(() => {
    const r = rng(7), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 250 }, () => [g(), g()]);
  }, []);
  const S = [[s1 * s1, rho * s1 * s2], [rho * s1 * s2, s2 * s2]];
  const { values, vectors } = symEig(S);
  // Cholesky of S to colour the standard normal samples.
  const l11 = s1, l21 = rho * s2, l22 = s2 * Math.sqrt(Math.max(1 - rho * rho, 0));
  const pts = z.map(([u, v]) => [l11 * u, l21 * u + l22 * v]);
  const W = 320, C = W / 2, K = 42;
  const P = (u: number, v: number) => [C + u * K, C - v * K];
  const ang = Math.atan2(vectors[0][1], vectors[0][0]);
  const fmt = (v: number) => v.toFixed(2);
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Correlated noise of two neurons with its covariance ellipse">
        <defs><clipPath id="cec"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#cec)">
          <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
          {pts.map(([u, v], i) => <circle key={i} cx={P(u, v)[0]} cy={P(u, v)[1]} r="2.2" fill="var(--ink-3)" opacity="0.6" />)}
          <ellipse cx={C} cy={C} rx={2 * Math.sqrt(values[0]) * K} ry={2 * Math.sqrt(Math.max(values[1], 1e-6)) * K} transform={`rotate(${-ang * 180 / Math.PI} ${C} ${C})`} fill="none" stroke="var(--accent)" strokeWidth="2" />
          {vectors.map((v, i) => { const L = 2 * Math.sqrt(Math.max(values[i], 0)); const [x2, y2] = P(v[0] * L, v[1] * L); return <Arrow key={i} id={`ce${i}`} x1={C} y1={C} x2={x2} y2={y2} color={i === 0 ? "var(--neuro)" : "var(--ai)"} width={3} />; })}
        </g>
        <text x={W - 8} y={C + 14} fontSize="10" textAnchor="end" fill="var(--ink-3)">neuron 1 noise</text>
        <text x={C + 6} y="14" fontSize="10" fill="var(--ink-3)">neuron 2 noise</text>
      </svg>
      <div className="space-y-3">
        <Slider label="standard deviation of neuron 1" value={s1} min={0.2} max={2} step={0.05} onChange={setS1} fmt={(v) => v.toFixed(2)} />
        <Slider label="standard deviation of neuron 2" value={s2} min={0.2} max={2} step={0.05} onChange={setS2} fmt={(v) => v.toFixed(2)} />
        <Slider label="noise correlation ρ" value={rho} min={-0.95} max={0.95} step={0.05} onChange={setRho} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="covariance matrix Σ" value={`[${fmt(S[0][0])} ${fmt(S[0][1])}; ${fmt(S[1][0])} ${fmt(S[1][1])}]`} />
          <Stat label="eigenvalues (variances along the axes)" value={`${fmt(values[0])}, ${fmt(values[1])}`} />
          <Stat label="angle of the long axis" value={`${(ang * 180 / Math.PI).toFixed(0)}°`} />
          <Stat label="eigenvectors orthogonal?" value={Math.abs(vectors[0][0] * vectors[1][0] + vectors[0][1] * vectors[1][1]) < 1e-6 ? "yes, always" : "no"} />
        </div>
        <p className="text-sm text-ink-2">Each dot is one trial's noise in two neurons. The ellipse is two standard deviations of the fitted Gaussian. Its axes are the eigenvectors of the covariance matrix, and their squared half-lengths are proportional to the eigenvalues. Because Σ is symmetric, the axes are always at right angles, whatever the correlation.</p>
      </div>
    </div>
  );
}
