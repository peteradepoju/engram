"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const phi = (z: number) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
function Phi(z: number) { // Abramowitz-Stegun approximation of the standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = phi(z);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

/** The null distribution of a z statistic, the observed value, and the two-sided p-value as the shaded tail area. */
export function NullDistribution() {
  const [effect, setEffect] = useState(0.3);
  const [n, setN] = useState(30);
  const z = effect * Math.sqrt(n);
  const p = 2 * (1 - Phi(Math.abs(z)));
  const W = 360, H = 200, lo = -4.5, hi = 7.5;
  const X = (v: number) => 14 + ((v - lo) / (hi - lo)) * (W - 24), Y = (d: number) => H - 26 - (d / 0.42) * (H - 44);
  const xs = Array.from({ length: 301 }, (_, i) => lo + (i / 300) * (hi - lo));
  const curve = (shift: number) => xs.map((v) => `${X(v)},${Y(phi(v - shift))}`).join(" ");
  const tail = (from: number, to: number) => { const pts = xs.filter((v) => v >= from && v <= to); return pts.length ? `M${X(pts[0])},${Y(0)} ` + pts.map((v) => `L${X(v)},${Y(phi(v))}`).join(" ") + ` L${X(pts[pts.length - 1])},${Y(0)} Z` : ""; };
  const a = Math.abs(z);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Null distribution with observed statistic">
        <path d={tail(a, hi)} fill="var(--neuro)" opacity="0.5" />
        <path d={tail(lo, -a)} fill="var(--neuro)" opacity="0.5" />
        <polyline points={curve(0)} fill="none" stroke="var(--ink-2)" strokeWidth="2" />
        <polyline points={curve(z)} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="5 3" />
        <line x1={X(z)} x2={X(z)} y1="12" y2={H - 26} stroke="var(--neuro)" strokeWidth="2.5" />
        <line x1="14" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[-4, -2, 0, 2, 4, 6].map((v) => <text key={v} x={X(v)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
        <text x="14" y={H + 10} fontSize="10" fill="var(--ink-2)">grey: null distribution of z</text>
        <text x="160" y={H + 10} fontSize="10" fill="var(--neuro)">line: observed z; shaded: p</text>
        <text x={W - 10} y="16" fontSize="10" textAnchor="end" fill="var(--ai)">dashed: z if the effect is real</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="true effect size (in sd units)" value={effect} min={0} max={1} step={0.01} onChange={setEffect} fmt={(v) => v.toFixed(2)} />
        <Slider label="sample size n" value={n} min={4} max={200} step={1} onChange={setN} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="z = effect × √n" value={z.toFixed(2)} />
        <Stat label="two-sided p" value={p < 0.0001 ? "< 0.0001" : p.toFixed(4)} />
        <Stat label="significant at 0.05?" value={p < 0.05 ? "yes" : "no"} />
      </div>
      <p className="text-sm text-ink-2">If there were no effect, the test statistic would follow the grey null distribution. The p-value is the probability, under that null, of a statistic at least as extreme as the one observed: the shaded tails. The same small effect gives a large p with few samples and a tiny p with many, so a p-value mixes the size of an effect with the amount of data. It is not the probability that the null hypothesis is true.</p>
    </div>
  );
}
