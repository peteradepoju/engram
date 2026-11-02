"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const f = (x: number) => 5 + 40 * Math.exp(-((x - 90) ** 2) / (2 * 25 ** 2));
const df = (x: number) => -40 * ((x - 90) / 25 ** 2) * Math.exp(-((x - 90) ** 2) / (2 * 25 ** 2));

/** A tuning curve, a secant through two points, and the tangent it approaches as the gap shrinks. */
export function SecantTangent() {
  const [x0, setX0] = useState(60);
  const [h, setH] = useState(30);
  const W = 540, H = 300, top = 190;
  const X = (x: number) => 40 + (x / 180) * (W - 60), Y = (r: number) => top - (r / 50) * (top - 15);
  const Yd = (d: number) => 252 - d * 22;
  const curve = Array.from({ length: 181 }, (_, i) => `${X(i)},${Y(f(i))}`).join(" ");
  const dcurve = Array.from({ length: 181 }, (_, i) => `${X(i)},${Yd(df(i))}`).join(" ");
  const sec = (f(x0 + h) - f(x0)) / h, tan = df(x0);
  const line = (m: number, c: string, dash?: string) => <line x1={X(x0 - 40)} y1={Y(f(x0) - 40 * m)} x2={X(x0 + 60)} y2={Y(f(x0) + 60 * m)} stroke={c} strokeWidth="2" strokeDasharray={dash} />;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Tuning curve with secant and tangent lines">
        <defs><clipPath id="stc"><rect x="40" y="10" width={W - 60} height={top - 5} /></clipPath></defs>
        {[0, 45, 90, 135, 180].map((d) => <text key={d} x={X(d)} y={top + 14} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{d}°</text>)}
        <line x1="40" x2={W - 20} y1={top} y2={top} stroke="var(--line)" />
        <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <g clipPath="url(#stc)">{line(tan, "var(--ai)")}{line(sec, "var(--neuro)", "5 4")}</g>
        <circle cx={X(x0)} cy={Y(f(x0))} r="5" fill="var(--ai)" />
        <circle cx={X(x0 + h)} cy={Y(f(x0 + h))} r="5" fill="var(--neuro)" />
        <text x="44" y="22" fontSize="10" fill="var(--ink-3)">firing rate (Hz) against orientation</text>
        <line x1="40" x2={W - 20} y1={Yd(0)} y2={Yd(0)} stroke="var(--line)" />
        <polyline points={dcurve} fill="none" stroke="var(--warn)" strokeWidth="2" />
        <circle cx={X(x0)} cy={Yd(tan)} r="4" fill="var(--warn)" />
        <text x={W - 24} y={H - 6} fontSize="10" textAnchor="end" fill="var(--warn)">below: slope of the tuning curve, f′(θ) (Hz per degree)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="orientation θ" value={x0} min={10} max={160} step={1} onChange={setX0} unit="°" />
        <Slider label="gap h" value={h} min={0.5} max={40} step={0.5} onChange={setH} unit="°" fmt={(v) => v.toFixed(1)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="secant slope (pink, dashed)" value={sec.toFixed(3)} />
        <Stat label="tangent slope f′(θ) (blue)" value={tan.toFixed(3)} />
        <Stat label="difference" value={(sec - tan).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The pink dashed secant joins the tuning curve at θ and θ + h; its slope is the average rate of change over the gap. Shrink h and it turns into the blue tangent, whose slope is the derivative. The orange curve below plots that derivative at every orientation: it is largest on the flanks of the tuning curve and zero at the peak.</p>
    </div>
  );
}
