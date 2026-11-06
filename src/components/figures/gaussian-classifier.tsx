"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Two classes of population responses, each Gaussian with a shared covariance: the Bayes-optimal boundary is a straight line (linear discriminant analysis). */
export function GaussianClassifier() {
  const [sep, setSep] = useState(1.6);
  const [rho, setRho] = useState(0.6);
  const [prior, setPrior] = useState(0.5);
  const W = 340, C = W / 2, K = 46;
  const P = (u: number, v: number) => [C + u * K, C - v * K];
  const m0 = [-sep / 2, -sep / 4], m1 = [sep / 2, sep / 4];
  const det = 1 - rho * rho, Si = [[1 / det, -rho / det], [-rho / det, 1 / det]];
  const dm = [m1[0] - m0[0], m1[1] - m0[1]];
  const w = [Si[0][0] * dm[0] + Si[0][1] * dm[1], Si[1][0] * dm[0] + Si[1][1] * dm[1]];
  const mid = [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2];
  const b = -(w[0] * mid[0] + w[1] * mid[1]) + Math.log(prior / (1 - prior));
  const pts = useMemo(() => {
    const r = rng(36), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Array.from({ length: 240 }, (_, i) => { const u = g(), v = g(); return { c: i % 2, z: [u, rho * u + Math.sqrt(1 - rho * rho) * v] }; });
  }, [rho]);
  const data = pts.map((p) => ({ c: p.c, x: [p.z[0] + (p.c ? m1[0] : m0[0]), p.z[1] + (p.c ? m1[1] : m0[1])] }));
  const acc = data.filter((d) => ((w[0] * d.x[0] + w[1] * d.x[1] + b) > 0 ? 1 : 0) === d.c).length / data.length;
  const dprime = Math.sqrt(dm[0] * w[0] + dm[1] * w[1]);
  // boundary line w.x + b = 0 across the box
  const xs = [-3.7, 3.7];
  const line = Math.abs(w[1]) > 1e-6 ? xs.map((x) => [x, -(w[0] * x + b) / w[1]]) : [[-b / w[0], -3.7], [-b / w[0], 3.7]];
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="Two Gaussian classes and the linear boundary between them">
        <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
        {data.map((d, i) => <circle key={i} cx={P(d.x[0], d.x[1])[0]} cy={P(d.x[0], d.x[1])[1]} r="2.4" fill={d.c ? "var(--neuro)" : "var(--ai)"} opacity="0.65" />)}
        <line x1={P(line[0][0], line[0][1])[0]} y1={P(line[0][0], line[0][1])[1]} x2={P(line[1][0], line[1][1])[0]} y2={P(line[1][0], line[1][1])[1]} stroke="var(--ink)" strokeWidth="2.5" />
        <text x="8" y="16" fontSize="10" fill="var(--ai)">stimulus A</text>
        <text x={W - 8} y="16" fontSize="10" textAnchor="end" fill="var(--neuro)">stimulus B</text>
        <text x={W - 8} y={C + 14} fontSize="10" textAnchor="end" fill="var(--ink-3)">neuron 1</text>
        <text x={C + 6} y={W - 8} fontSize="10" fill="var(--ink-3)">neuron 2</text>
      </svg>
      <div className="space-y-3">
        <Slider label="separation of the class means" value={sep} min={0} max={4} step={0.05} onChange={setSep} fmt={(v) => v.toFixed(2)} />
        <Slider label="noise correlation ρ (shared by both classes)" value={rho} min={-0.9} max={0.9} step={0.05} onChange={setRho} fmt={(v) => v.toFixed(2)} />
        <Slider label="prior probability of stimulus B" value={prior} min={0.05} max={0.95} step={0.05} onChange={setPrior} fmt={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="accuracy on these points" value={acc.toFixed(2)} />
          <Stat label="discriminability d′" value={dprime.toFixed(2)} />
        </div>
        <p className="text-sm text-ink-2">Responses of two neurons to two stimuli. Each class is a Gaussian cloud with the same covariance. Bayes&apos; rule then gives a straight boundary, perpendicular not to the line joining the means but to Σ⁻¹ times it, so the noise correlation tilts it. Changing the prior slides the boundary towards the less likely class. d′ is the separation measured in units of the noise along the best direction, the Mahalanobis distance between the means.</p>
      </div>
    </div>
  );
}
