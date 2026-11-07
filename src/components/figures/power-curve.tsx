"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const phi = (z: number) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
function Phi(z: number) { const t = 1 / (1 + 0.2316419 * Math.abs(z)), p = phi(z) * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))); return z >= 0 ? 1 - p : p; }

/** Power of a two-sided z-test: the chance of detecting a real effect, as a function of effect size and sample size. */
export function PowerCurve() {
  const [d, setD] = useState(0.5);
  const [n, setN] = useState(20);
  const zc = 1.96;
  const power = (dd: number, nn: number) => { const s = dd * Math.sqrt(nn); return 1 - Phi(zc - s) + Phi(-zc - s); };
  const W = 360, H = 150, lo = -4, hi = 8;
  const X = (v: number) => 14 + ((v - lo) / (hi - lo)) * (W - 24), Y = (v: number) => H - 22 - (v / 0.42) * (H - 34);
  const xs = Array.from({ length: 241 }, (_, i) => lo + (i / 240) * (hi - lo));
  const s = d * Math.sqrt(n);
  const area = (f: (v: number) => number, from: number, to: number) => { const pts = xs.filter((v) => v >= from && v <= to); return pts.length ? `M${X(pts[0])},${Y(0)} ` + pts.map((v) => `L${X(v)},${Y(f(v))}`).join(" ") + ` L${X(pts[pts.length - 1])},${Y(0)} Z` : ""; };
  const P2 = 140, ns = Array.from({ length: 100 }, (_, i) => i + 2);
  const NX = (v: number) => 30 + (v / 101) * (W - 40), NY = (p: number) => P2 - 18 - p * (P2 - 30);
  const n80 = ns.find((v) => power(d, v) >= 0.8);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + P2 + 10}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Null and alternative distributions, and power against sample size">
        <path d={area((v) => phi(v - s), zc, hi)} fill="var(--ai)" opacity="0.35" />
        <path d={area((v) => phi(v), zc, hi)} fill="var(--neuro)" opacity="0.6" />
        <polyline points={xs.map((v) => `${X(v)},${Y(phi(v))}`).join(" ")} fill="none" stroke="var(--ink-2)" strokeWidth="2" />
        <polyline points={xs.map((v) => `${X(v)},${Y(phi(v - s))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1={X(zc)} x2={X(zc)} y1="8" y2={H - 22} stroke="var(--ink)" strokeDasharray="4 3" />
        <line x1="14" x2={W - 10} y1={H - 22} y2={H - 22} stroke="var(--line)" />
        <text x="14" y="14" fontSize="10" fill="var(--ink-2)">null</text>
        <text x={W - 10} y="14" fontSize="10" textAnchor="end" fill="var(--ai)">effect present: blue area = power</text>
        <text x={W - 10} y="27" fontSize="10" textAnchor="end" fill="var(--neuro)">pink area = α (false alarms)</text>
        <g transform={`translate(0 ${H})`}>
          <line x1="30" x2={W - 10} y1={P2 - 18} y2={P2 - 18} stroke="var(--line)" />
          <line x1="30" x2={W - 10} y1={NY(0.8)} y2={NY(0.8)} stroke="var(--good)" strokeDasharray="3 3" />
          <polyline points={ns.map((v) => `${NX(v)},${NY(power(d, v))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.5" />
          <circle cx={NX(n)} cy={NY(power(d, n))} r="5" fill="var(--neuro)" />
          {[0, 25, 50, 75, 100].map((v) => <text key={v} x={NX(v)} y={P2 - 4} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
          <text x="26" y={NY(0.8) + 3} fontSize="9" textAnchor="end" fill="var(--good)">0.8</text>
          <text x="40" y="12" fontSize="10" fill="var(--ink-3)">power against sample size n</text>
        </g>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="effect size d" value={d} min={0.05} max={1.5} step={0.01} onChange={setD} fmt={(v) => v.toFixed(2)} />
        <Slider label="sample size n" value={n} min={2} max={100} step={1} onChange={setN} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="power" value={power(d, n).toFixed(2)} />
        <Stat label="n for 80% power" value={n80 ? String(n80) : "> 100"} />
        <Stat label="α" value="0.05" />
      </div>
      <p className="text-sm text-ink-2">Top: the distribution of the test statistic with no effect (grey) and with an effect of size d (blue). Results beyond the dashed threshold are declared significant. The pink area is the false alarm rate α; the blue area is the power, the chance of detecting a real effect. Bottom: power grows with sample size, slowly for small effects. A study with 20% power misses real effects four times out of five.</p>
    </div>
  );
}
