"use client";

import { useState } from "react";
import { eig2 } from "./linalg";
import { Slider, Stat } from "./util";

/** The characteristic polynomial of a 2 by 2 matrix, λ² − (trace) λ + det, and its roots. */
export function CharPoly() {
  const [m, setM] = useState<[number, number, number, number]>([2, 1, 1, 2]);
  const [a, b, c, d] = m;
  const set = (i: number) => (v: number) => setM((old) => old.map((q, k) => (k === i ? v : q)) as [number, number, number, number]);
  const e = eig2(a, b, c, d), t = e.trace, det = e.det;
  const W = 520, H = 240, X = (l: number) => 30 + ((l + 4) / 8) * (W - 50), Y = (p: number) => 130 - p * 16;
  const pts = Array.from({ length: 161 }, (_, i) => { const l = -4 + i * 0.05; return `${X(l)},${Y(l * l - t * l + det)}`; }).join(" ");
  const fmt = (v: number) => v.toFixed(2);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Characteristic polynomial and its roots">
        <defs><clipPath id="cpc"><rect x="0" y="30" width={W} height={H - 50} /></clipPath></defs>
        {[-4, -2, 0, 2, 4].map((l) => <g key={l}><line x1={X(l)} x2={X(l)} y1="30" y2={H - 20} stroke="var(--line)" /><text x={X(l)} y={H - 6} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{l}</text></g>)}
        <line x1={X(-4)} x2={X(4)} y1={Y(0)} y2={Y(0)} stroke="var(--ink-3)" />
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2.5" clipPath="url(#cpc)" />
        {e.real ? [e.l1, e.l2].map((l, i) => <circle key={i} cx={X(l)} cy={Y(0)} r="6" fill="var(--neuro)" />) : (
          <text x={W / 2} y="44" fontSize="11" textAnchor="middle" fill="var(--warn)">the parabola never touches zero: complex eigenvalues {fmt(e.l1)} ± {fmt(e.im)}i</text>)}
        <text x={W - 14} y={Y(0) - 6} fontSize="10" textAnchor="end" fill="var(--ink-3)">λ</text>
        <text x="36" y="18" fontSize="10" fill="var(--ink-3)">p(λ) = λ² − ({fmt(t)})λ + ({fmt(det)})</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-4">
        <Slider label="a" value={a} min={-3} max={3} step={0.1} onChange={set(0)} fmt={(v) => v.toFixed(1)} />
        <Slider label="b" value={b} min={-3} max={3} step={0.1} onChange={set(1)} fmt={(v) => v.toFixed(1)} />
        <Slider label="c" value={c} min={-3} max={3} step={0.1} onChange={set(2)} fmt={(v) => v.toFixed(1)} />
        <Slider label="d" value={d} min={-3} max={3} step={0.1} onChange={set(3)} fmt={(v) => v.toFixed(1)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="trace = λ₁ + λ₂" value={fmt(t)} />
        <Stat label="det = λ₁ λ₂" value={fmt(det)} />
        <Stat label="discriminant t²/4 − det" value={fmt(t * t / 4 - det)} />
        <Stat label="eigenvalues" value={e.real ? `${fmt(e.l1)}, ${fmt(e.l2)}` : `${fmt(e.l1)} ± ${fmt(e.im)}i`} />
      </div>
      <p className="text-sm text-ink-2">The eigenvalues are where the parabola crosses zero (pink dots). Changing b and c alone (keeping their product) leaves the polynomial unchanged. Make b and c opposite in sign and the parabola lifts off the axis: the eigenvalues become a complex pair, and the matrix includes a rotation.</p>
    </div>
  );
}
