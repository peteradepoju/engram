"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

// A receptor's rate after a step stimulus at t = 0.2 s: a fast rise then adaptation (as in Adrian and Zotterman).
const rate = (t: number) => (t < 0.2 ? 5 : 5 + 60 * Math.exp(-(t - 0.2) / 0.15) + 20 * (1 - Math.exp(-(t - 0.2) / 0.05)));
const exact = (() => { let s = 0; const n = 20000; for (let i = 0; i < n; i++) s += rate((i + 0.5) / n) / n; return s; })();

/** Expected spike count as the area under a firing-rate curve, approximated by rectangles. */
export function RiemannSum() {
  const [n, setN] = useState(8);
  const [rule, setRule] = useState<"left" | "midpoint">("left");
  const W = 540, H = 240, X = (t: number) => 40 + t * (W - 60), Y = (r: number) => 210 - r * 2.2;
  const dt = 1 / n;
  const rects = Array.from({ length: n }, (_, i) => { const t = i * dt + (rule === "midpoint" ? dt / 2 : 0); return { x: i * dt, h: rate(t) }; });
  const sum = rects.reduce((a, r) => a + r.h * dt, 0);
  const curve = Array.from({ length: 401 }, (_, i) => `${X(i / 400)},${Y(rate(i / 400))}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Rectangles approximating the area under a firing-rate curve">
        {rects.map((r, i) => <rect key={i} x={X(r.x)} y={Y(r.h)} width={X(dt) - X(0)} height={210 - Y(r.h)} fill="var(--ai)" opacity="0.3" stroke="var(--ai)" strokeWidth="0.8" />)}
        <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <line x1="40" x2={W - 20} y1="210" y2="210" stroke="var(--line)" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={X(t)} y="226" fontSize="10" textAnchor="middle" fill="var(--ink-3)">{t} s</text>)}
        {[0, 25, 50, 75].map((r) => <text key={r} x="34" y={Y(r) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)">{r}</text>)}
        <text x="46" y="16" fontSize="10" fill="var(--ink-3)">firing rate (Hz) of a stretch receptor; a stimulus starts at 0.2 s</text>
      </svg>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1"><Slider label="number of rectangles" value={n} min={1} max={100} step={1} onChange={setN} /></div>
        <button className={`btn !py-1.5 ${rule === "left" ? "btn-primary" : ""}`} onClick={() => setRule("left")}>left edge</button>
        <button className={`btn !py-1.5 ${rule === "midpoint" ? "btn-primary" : ""}`} onClick={() => setRule("midpoint")}>midpoint</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="sum of rectangles" value={sum.toFixed(3)} />
        <Stat label="exact integral (expected spikes)" value={exact.toFixed(3)} />
        <Stat label="error" value={(sum - exact).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each rectangle's area is a rate (spikes per second) times a duration (seconds): an expected number of spikes. Adding them up approximates the area under the curve, the expected total count in one second. More rectangles shrink the error, and sampling each at its midpoint shrinks it much faster than at its left edge.</p>
    </div>
  );
}
