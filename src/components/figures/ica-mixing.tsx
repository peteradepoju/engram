"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** Two independent sources, mixed; PCA finds uncorrelated axes, ICA finds the independent ones. */
export function IcaMixing() {
  const [angle, setAngle] = useState(35);
  const res = useMemo(() => {
    const r = rng(612), n = 500;
    const s1 = Array.from({ length: n }, () => (r() < 0.1 ? 3 * Math.abs(gauss(r)) : 0.15 * gauss(r)));   // sparse, spiky
    const s2 = Array.from({ length: n }, () => 2 * r() - 1);                                                     // uniform
    const a = (angle * Math.PI) / 180;
    const A = [[1, Math.cos(a)], [0.2, Math.sin(a)]];
    const X = s1.map((u, i) => [A[0][0] * u + A[0][1] * s2[i], A[1][0] * u + A[1][1] * s2[i]]);
    const mean = [0, 1].map((k) => X.reduce((s, x) => s + x[k], 0) / n);
    const Xc = X.map((x) => [x[0] - mean[0], x[1] - mean[1]]);
    const c = [[0, 0], [0, 0]]; Xc.forEach((x) => { c[0][0] += x[0] * x[0] / n; c[0][1] += x[0] * x[1] / n; c[1][1] += x[1] * x[1] / n; }); c[1][0] = c[0][1];
    const th = 0.5 * Math.atan2(2 * c[0][1], c[0][0] - c[1][1]);
    const ev = [c[0][0] * Math.cos(th) ** 2 + 2 * c[0][1] * Math.sin(th) * Math.cos(th) + c[1][1] * Math.sin(th) ** 2, c[0][0] * Math.sin(th) ** 2 - 2 * c[0][1] * Math.sin(th) * Math.cos(th) + c[1][1] * Math.cos(th) ** 2];
    const Z = Xc.map((x) => { const u = Math.cos(th) * x[0] + Math.sin(th) * x[1], v = -Math.sin(th) * x[0] + Math.cos(th) * x[1]; return [u / Math.sqrt(ev[0]), v / Math.sqrt(ev[1])]; });
    let best = 0, bk = -1;
    for (let k = 0; k < 180; k++) {
      const p = (k * Math.PI) / 180, kurt = Z.reduce((s, z) => s + (Math.cos(p) * z[0] + Math.sin(p) * z[1]) ** 4, 0) / n - 3;
      if (Math.abs(kurt) > bk) { bk = Math.abs(kurt); best = p; }
    }
    const recover = (p: number): number[] => Z.map((z) => Math.cos(p) * z[0] + Math.sin(p) * z[1]);
    const corr = (u: number[], v: number[]): number => { const mu = u.reduce((a2, b) => a2 + b, 0) / n, mv = v.reduce((a2, b) => a2 + b, 0) / n; let su = 0, sv = 0, cv = 0; u.forEach((x, i) => { su += (x - mu) ** 2; sv += (v[i] - mv) ** 2; cv += (x - mu) * (v[i] - mv); }); return cv / Math.sqrt(su * sv); };
    const ic1 = recover(best), ic2 = recover(best + Math.PI / 2);
    const icaMatch = Math.max(Math.abs(corr(ic1, s1)), Math.abs(corr(ic2, s1)));
    const pcaMatch = Math.max(Math.abs(corr(Xc.map((x) => Math.cos(th) * x[0] + Math.sin(th) * x[1]), s1)), Math.abs(corr(Xc.map((x) => -Math.sin(th) * x[0] + Math.cos(th) * x[1]), s1)));
    return { Xc, th, icaMatch, pcaMatch, A };
  }, [angle]);
  const sx = (x: number): number => 170 + x * 35, sy = (y: number): number => 85 - y * 35;
  const col = (v: number[]) => { const n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n]; };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Mixed signals with PCA and ICA axes">
        {res.Xc.map((x, i) => <circle key={i} cx={sx(x[0])} cy={sy(x[1])} r="1.4" fill="var(--ink-3)" opacity="0.6" />)}
        {[res.th, res.th + Math.PI / 2].map((t, k) => <line key={k} x1={sx(-3 * Math.cos(t))} y1={sy(-3 * Math.sin(t))} x2={sx(3 * Math.cos(t))} y2={sy(3 * Math.sin(t))} stroke="var(--neuro)" strokeWidth="1.5" strokeDasharray="4 3" />)}
        {[0, 1].map((k) => { const c = col([res.A[0][k], res.A[1][k]]); return <line key={k} x1={sx(-3 * c[0])} y1={sy(-3 * c[1])} x2={sx(3 * c[0])} y2={sy(3 * c[1])} stroke="var(--ai)" strokeWidth="2" />; })}
        <text x="10" y="14" fontSize="8" fill="var(--neuro)">dashed: principal axes</text>
        <text x="10" y="25" fontSize="8" fill="var(--ai)">solid: true mixing directions</text>
      </svg>
      <Slider label="angle between the mixing directions (degrees)" value={angle} min={10} max={90} step={1} onChange={setAngle} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="best PCA axis against the spiky source (|r|)" value={res.pcaMatch.toFixed(3)} />
        <Stat label="ICA component against it" value={res.icaMatch.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">A spiky source and a uniform one are mixed into two recorded channels. The principal axes are always orthogonal and follow the variance, so they cut across the mixing directions unless those happen to be orthogonal too. ICA whitens the data and then rotates to the axes of most non-Gaussian projection, recovering the spiky source almost exactly.</p>
    </div>
  );
}
