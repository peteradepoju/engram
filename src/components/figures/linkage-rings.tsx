"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** k-means against single-linkage clustering on two concentric rings. */
export function LinkageRings() {
  const [noise, setNoise] = useState(0.08);
  const res = useMemo(() => {
    const r = rng(604), n = 160;
    const truth = Array.from({ length: n }, (_, i): number => (i < 70 ? 0 : 1));
    const pts = truth.map((t): number[] => { const a = 2 * Math.PI * r(), rad = t === 0 ? 0.45 : 1.2; return [rad * Math.cos(a) + noise * gauss(r), rad * Math.sin(a) + noise * gauss(r)]; });
    let C = [[-0.3, 0], [0.3, 0.1]], km: number[] = [];
    for (let it = 0; it < 30; it++) {
      km = pts.map((p) => ((p[0] - C[0][0]) ** 2 + (p[1] - C[0][1]) ** 2 < (p[0] - C[1][0]) ** 2 + (p[1] - C[1][1]) ** 2 ? 0 : 1));
      C = [0, 1].map((k) => { const m = pts.filter((_, i) => km[i] === k); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : C[k]; });
    }
    const edges: [number, number, number][] = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([(pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2, i, j]);
    edges.sort((a, b) => a[0] - b[0]);
    const par = Array.from({ length: n }, (_, i) => i);
    const find = (i: number): number => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
    let groups = n;
    for (const [, i, j] of edges) { if (groups === 2) break; const a = find(i), b = find(j); if (a !== b) { par[a] = b; groups--; } }
    const root0 = find(0), sl = pts.map((_, i) => (find(i) === root0 ? 0 : 1));
    const acc = (lab: number[]): number => { const a = lab.filter((l, i) => l === truth[i]).length / n; return Math.max(a, 1 - a); };
    return { pts, km, sl, accKm: acc(km), accSl: acc(sl) };
  }, [noise]);
  const panel = (lab: number[], ox: number) => res.pts.map((p, i) => <circle key={i} cx={ox + 80 + p[0] * 55} cy={90 + p[1] * 55} r="2.3" fill={lab[i] ? "var(--ai)" : "var(--neuro)"} opacity="0.8" />);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 185" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="k-means and single linkage on rings">
        {panel(res.km, 0)}{panel(res.sl, 170)}
        <text x="80" y="180" fontSize="9" textAnchor="middle" fill="var(--ink-3)">k-means</text>
        <text x="250" y="180" fontSize="9" textAnchor="middle" fill="var(--ink-3)">single linkage</text>
      </svg>
      <Slider label="noise" value={noise} min={0} max={0.3} step={0.01} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="k-means agreement with rings" value={res.accKm.toFixed(2)} />
        <Stat label="single linkage agreement" value={res.accSl.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">k-means cuts the plane into convex regions around centres, so it splits both rings down the middle. Single linkage joins the closest pairs of points first and follows each ring round, separating them perfectly when the gap between rings is wider than the gaps along them. Add noise and a few bridging points are enough to chain the rings together.</p>
    </div>
  );
}
