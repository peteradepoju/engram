"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

/** For separable classes, each boundary direction has a margin; the SVM picks the direction with the widest. */
export function MarginExplorer() {
  const [ang, setAng] = useState(30);
  const pts = useMemo(() => { const r = rng(573); return Array.from({ length: 40 }, (_, i): [number, number, number] => { const c = i % 2 ? 1 : -1; return [0.5 * gauss(r) + 1.1 * c, 0.5 * gauss(r) + 0.6 * c, c]; }); }, []);
  const best = useMemo(() => {
    let b = { a: 0, m: -1 };
    for (let a = 0; a < 180; a += 0.5) {
      const w = [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
      const pr = pts.map(([x, y, c]) => [x * w[0] + y * w[1], c]);
      const lo = Math.max(...pr.filter((p) => p[1] < 0).map((p) => p[0])), hi = Math.min(...pr.filter((p) => p[1] > 0).map((p) => p[0]));
      if ((hi - lo) / 2 > b.m) b = { a, m: (hi - lo) / 2 };
    }
    return b;
  }, [pts]);
  const w = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)];
  const proj = pts.map(([x, y, c]) => [x * w[0] + y * w[1], c]);
  const lo = Math.max(...proj.filter((p) => p[1] < 0).map((p) => p[0])), hi = Math.min(...proj.filter((p) => p[1] > 0).map((p) => p[0]));
  const margin = (hi - lo) / 2, mid = (hi + lo) / 2;
  const sx = (v: number): number => 170 + v * 45, sy = (v: number): number => 95 - v * 45;
  const lineAt = (c: number): string => { const p0 = [w[0] * c, w[1] * c], d = [-w[1], w[0]]; return `${sx(p0[0] - 5 * d[0])},${sy(p0[1] - 5 * d[1])} ${sx(p0[0] + 5 * d[0])},${sy(p0[1] + 5 * d[1])}`; };
  const sv = proj.map((p, i) => ((p[1] < 0 && Math.abs(p[0] - lo) < 1e-9) || (p[1] > 0 && Math.abs(p[0] - hi) < 1e-9) ? i : -1)).filter((i) => i >= 0);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 190" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Margins of separating lines">
        {margin > 0 && <polyline points={lineAt(lo)} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />}
        {margin > 0 && <polyline points={lineAt(hi)} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />}
        <polyline points={lineAt(mid)} fill="none" stroke={margin > 0 ? "var(--ink)" : "var(--warn)"} strokeWidth="1.8" />
        {pts.map(([x, y, c], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r={sv.includes(i) ? 5 : 3} fill={c > 0 ? "var(--neuro)" : "var(--ai)"} stroke={sv.includes(i) ? "var(--ink)" : "none"} />)}
      </svg>
      <Slider label="direction of the boundary's normal (degrees)" value={ang} min={0} max={179} step={0.5} onChange={setAng} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="margin at this angle" value={margin > 0 ? margin.toFixed(3) : "not separating"} />
        <Stat label="widest margin" value={best.m.toFixed(3)} />
        <Stat label="at angle" value={`${best.a.toFixed(1)}°`} />
      </div>
      <p className="text-sm text-ink-2">For each direction the best boundary sits midway between the closest points of the two classes (outlined). The margin is half the gap. Many lines separate the classes; the maximum-margin line is the one the support vector machine finds, and it is fixed by those few closest points alone.</p>
    </div>
  );
}
