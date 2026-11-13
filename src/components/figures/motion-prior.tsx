"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Constraint lines for a plaid, the slow-speed prior and the MAP velocity as noise varies. */
export function MotionPrior() {
  const [logSig, setLogSig] = useState(-1);
  const [a1, setA1] = useState(50);
  const [a2, setA2] = useState(75);
  const sig = Math.pow(10, logSig);
  const n = [a1, a2].map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)]);
  const s = n.map((v) => v[0]);
  const A = [[0, 0], [0, 0]], b = [0, 0];
  n.forEach((v, i) => { for (let p = 0; p < 2; p++) { b[p] += (v[p] * s[i]) / sig ** 2; for (let q = 0; q < 2; q++) A[p][q] += (v[p] * v[q]) / sig ** 2; } });
  A[0][0] += 1; A[1][1] += 1;
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const vx = (A[1][1] * b[0] - A[0][1] * b[1]) / det, vy = (A[0][0] * b[1] - A[1][0] * b[0]) / det;
  const va = [0, 1].map((p) => (s[0] * n[0][p] + s[1] * n[1][p]) / 2);
  const S = 90, ox = 120, oy = 120, X = (x: number) => ox + x * S, Y = (y: number) => oy - y * S;
  const line = (v: number[], si: number) => { const p0 = [v[0] * si, v[1] * si], d = [-v[1], v[0]]; return `${X(p0[0] - 2 * d[0])},${Y(p0[1] - 2 * d[1])} ${X(p0[0] + 2 * d[0])},${Y(p0[1] + 2 * d[1])}`; };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 200" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Velocity space with constraint lines">
        <circle cx={X(0)} cy={Y(0)} r={S * 0.5} fill="var(--ai)" opacity="0.08" />
        <circle cx={X(0)} cy={Y(0)} r={S} fill="var(--ai)" opacity="0.06" />
        <line x1="10" x2="350" y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <line x1={X(0)} x2={X(0)} y1="5" y2="195" stroke="var(--line)" />
        {n.map((v, i) => <polyline key={i} points={line(v, s[i])} fill="none" stroke="var(--ink-3)" strokeWidth="1" />)}
        <circle cx={X(1)} cy={Y(0)} r="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <text x={X(1) + 6} y={Y(0) + 12} fontSize="8" fill="var(--ink)">true (IOC)</text>
        <circle cx={X(va[0])} cy={Y(va[1])} r="3" fill="var(--ai)" />
        <text x={X(va[0]) + 5} y={Y(va[1])} fontSize="8" fill="var(--ai)">vector average</text>
        <line x1={X(0)} y1={Y(0)} x2={X(vx)} y2={Y(vy)} stroke="var(--neuro)" strokeWidth="2.5" />
        <circle cx={X(vx)} cy={Y(vy)} r="4" fill="var(--neuro)" />
        <text x={X(0) + 4} y="14" fontSize="8" fill="var(--ink-3)">shaded: slow-speed prior</text>
      </svg>
      <Slider label="measurement noise (log10), falls with contrast" value={logSig} min={-2} max={0.6} step={0.05} onChange={setLogSig} fmt={(v) => v.toFixed(2)} />
      <Slider label="orientation of component 1 normal" value={a1} min={10} max={170} step={1} onChange={setA1} unit="°" />
      <Slider label="orientation of component 2 normal" value={a2} min={10} max={170} step={1} onChange={setA2} unit="°" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="perceived direction" value={`${((Math.atan2(vy, vx) * 180) / Math.PI).toFixed(1)}°`} />
        <Stat label="perceived speed" value={Math.hypot(vx, vy).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The grey lines are the two components&apos; constraint lines; they cross at the true velocity. The pink arrow is the percept. Raise the noise and it shrinks towards the origin and swings towards the vector average.</p>
    </div>
  );
}
