"use client";

import { useState } from "react";
import { useSvgDrag } from "./drag";
import { Stat } from "./util";

/** Drag the data points. The least-squares line minimises the total area of the squares on the residuals. */
export function LeastSquares() {
  const [pts, setPts] = useState([[1, 2.2], [2, 2.8], [3, 4.6], [4, 4.4], [5, 6.1], [6, 6.3], [7, 8.4]]);
  const [mode, setMode] = useState<"fit" | "manual">("fit");
  const [m2, setM2] = useState(0.5), [c2, setC2] = useState(3);
  const W = 360, H = 260, S = 38;
  const px = (x: number) => 30 + x * S * 1.2, py = (y: number) => H - 20 - y * S * 0.8;
  const inv = (X: number, Y: number) => [Math.round(((X - 30) / (S * 1.2)) * 10) / 10, Math.round(((H - 20 - Y) / (S * 0.8)) * 10) / 10];
  const drag = useSvgDrag((k, X, Y) => { const i = Number(k); setPts((p) => p.map((q, j) => (j === i ? [p[i][0], Math.max(0, Math.min(9, inv(X, Y)[1]))] : q))); });
  const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  const sxy = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0), sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const slope = mode === "fit" ? sxy / sxx : m2, icpt = mode === "fit" ? my - (sxy / sxx) * mx : c2;
  const sse = pts.reduce((s, p) => s + (p[1] - (slope * p[0] + icpt)) ** 2, 0);
  return (
    <div className="space-y-3">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Data, a fitted line and squared residuals">
        {pts.map(([x, y], i) => {
          const yh = slope * x + icpt, r = y - yh, side = Math.abs(py(y) - py(yh));
          return <rect key={`s${i}`} x={px(x)} y={Math.min(py(y), py(yh))} width={side} height={side} fill="var(--bad)" opacity="0.18" />;
        })}
        <line x1={px(0)} y1={py(icpt)} x2={px(8)} y2={py(slope * 8 + icpt)} stroke="var(--accent)" strokeWidth="2.5" />
        {pts.map(([x, y], i) => <g key={i}><line x1={px(x)} x2={px(x)} y1={py(y)} y2={py(slope * x + icpt)} stroke="var(--bad)" />
          <circle cx={px(x)} cy={py(y)} r="7" fill="var(--neuro)" {...drag.handle(String(i))} /></g>)}
        <text x={W - 10} y={H - 6} fontSize="11" textAnchor="end" fill="var(--ink-3)">stimulus contrast (x)</text>
        <text x="8" y="14" fontSize="11" fill="var(--ink-3)">rate (y)</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${mode === "fit" ? "btn-primary" : ""}`} onClick={() => setMode("fit")}>Least-squares line</button>
        <button className={`btn !py-1.5 ${mode === "manual" ? "btn-primary" : ""}`} onClick={() => { setM2(slope); setC2(icpt); setMode("manual"); }}>Set the line by hand</button>
      </div>
      {mode === "manual" ? (
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <label>slope {m2.toFixed(2)}<input type="range" min={-1} max={2} step={0.01} value={m2} onChange={(e) => setM2(Number(e.target.value))} className="w-full accent-[var(--accent)]" /></label>
          <label>intercept {c2.toFixed(2)}<input type="range" min={-2} max={6} step={0.01} value={c2} onChange={(e) => setC2(Number(e.target.value))} className="w-full accent-[var(--accent)]" /></label>
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="slope" value={slope.toFixed(3)} /><Stat label="intercept" value={icpt.toFixed(3)} /><Stat label="sum of squared residuals" value={sse.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Drag points up and down. The red squares are the squared residuals; least squares makes their total area as small as possible. Set the line by hand and try to beat it: you cannot.</p>
    </div>
  );
}
