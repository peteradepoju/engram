"use client";

import { useState } from "react";
import { eig2 } from "./linalg";
import { Slider, Stat } from "./util";

const PRESETS: Record<string, [number, number, number, number]> = {
  "stable node": [-1, 0.3, 0.2, -0.5], saddle: [0.6, 0.4, 0.6, -0.8], "stable spiral": [-0.3, -1.2, 1.2, -0.3], "unstable spiral": [0.2, -1, 1, 0.2], centre: [0, -1, 1, 0], "line attractor": [-0.5, 0.5, 0.5, -0.5],
};

function classify(e: ReturnType<typeof eig2>) {
  const eps = 0.02;
  if (!e.real) return Math.abs(e.l1) < eps ? "centre: closed orbits" : e.l1 < 0 ? "stable spiral: damped oscillation" : "unstable spiral: growing oscillation";
  const [p, q] = [e.l1, e.l2];
  if (Math.abs(p) < eps || Math.abs(q) < eps) return "a zero eigenvalue: a line of fixed points";
  if (p > 0 && q > 0) return "unstable node: everything grows";
  if (p < 0 && q < 0) return "stable node: everything decays";
  return "saddle: decays along one direction, grows along the other";
}

/** Phase portrait of dx/dt = A x. Eigenvalues decide whether activity decays, grows or oscillates. */
export function PhasePortrait() {
  const [m, setM] = useState<[number, number, number, number]>([-0.3, -1.2, 1.2, -0.3]);
  const [a, b, c, d] = m;
  const set = (i: number) => (v: number) => setM((old) => old.map((q, k) => (k === i ? v : q)) as [number, number, number, number]);
  const W = 320, C = W / 2, S = 50;
  const P = (u: number, v: number) => [C + u * S, C - v * S];
  const e = eig2(a, b, c, d);
  const arrows = [];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    const u = i * 0.9, v = j * 0.9, du = a * u + b * v, dv = c * u + d * v, n = Math.hypot(du, dv) || 1, L = 0.28;
    const [x1, y1] = P(u, v), [x2, y2] = P(u + du / n * L, v + dv / n * L);
    arrows.push(<line key={`${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-3)" strokeWidth="1.2" />, <circle key={`c${i}${j}`} cx={x2} cy={y2} r="1.6" fill="var(--ink-3)" />);
  }
  const starts = [[2.6, 0.4], [-2.4, 1.6], [0.5, -2.6], [-1.2, -2.2], [1.8, 2.3]];
  const trajs = starts.map(([u0, v0]) => {
    let u = u0, v = v0; const pts = [P(u, v)];
    for (let k = 0; k < 400; k++) { const du = a * u + b * v, dv = c * u + d * v; u += 0.02 * du; v += 0.02 * dv; if (Math.abs(u) > 6 || Math.abs(v) > 6) break; pts.push(P(u, v)); }
    return pts.map((p) => p.join(",")).join(" ");
  });
  const fmt = (v: number) => v.toFixed(2);
  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[320px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Phase portrait of a linear system">
        <defs><clipPath id="ppc"><rect width={W} height={W} /></clipPath></defs>
        <g clipPath="url(#ppc)">
          <line x1="0" x2={W} y1={C} y2={C} stroke="var(--line)" /><line y1="0" y2={W} x1={C} x2={C} stroke="var(--line)" />
          {arrows}
          {e.real ? [e.v1!, e.v2!].map((v, i) => <line key={i} x1={P(-6 * v[0], -6 * v[1])[0]} y1={P(-6 * v[0], -6 * v[1])[1]} x2={P(6 * v[0], 6 * v[1])[0]} y2={P(6 * v[0], 6 * v[1])[1]} stroke="var(--warn)" strokeDasharray="5 4" />) : null}
          {trajs.map((pts, i) => <polyline key={i} points={pts} fill="none" stroke="var(--ai)" strokeWidth="2" />)}
          {starts.map(([u, v], i) => <circle key={i} cx={P(u, v)[0]} cy={P(u, v)[1]} r="4" fill="var(--neuro)" />)}
        </g>
        <text x="8" y="16" fontSize="10" fill="var(--ink-3)">rate of population 2 (x₂)</text>
        <text x={W - 8} y={C - 6} fontSize="10" textAnchor="end" fill="var(--ink-3)">x₁</text>
      </svg>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PRESETS).map(([name, v]) => <button key={name} className="chip !py-1" onClick={() => setM(v)}>{name}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Slider label="a" value={a} min={-2} max={2} step={0.05} onChange={set(0)} fmt={(v) => v.toFixed(2)} />
          <Slider label="b" value={b} min={-2} max={2} step={0.05} onChange={set(1)} fmt={(v) => v.toFixed(2)} />
          <Slider label="c" value={c} min={-2} max={2} step={0.05} onChange={set(2)} fmt={(v) => v.toFixed(2)} />
          <Slider label="d" value={d} min={-2} max={2} step={0.05} onChange={set(3)} fmt={(v) => v.toFixed(2)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="eigenvalues" value={e.real ? `${fmt(e.l1)}, ${fmt(e.l2)}` : `${fmt(e.l1)} ± ${fmt(e.im)}i`} />
          <Stat label="trace, det" value={`${fmt(e.trace)}, ${fmt(e.det)}`} />
        </div>
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm"><span className="text-ink-3">behaviour: </span>{classify(e)}</p>
        <p className="text-sm text-ink-2">Grey ticks show the direction of change dx/dt = Ax at each point; blue curves are trajectories from the pink starts. Negative real parts mean activity dies away, positive mean it explodes, and an imaginary part makes it rotate. The dashed lines are the eigenvectors, along which motion is straight.</p>
      </div>
    </div>
  );
}
