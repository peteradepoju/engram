"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const DT = 0.01, T = 60;
function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }
type M = number[][];
const mul = (a: M, b: M) => a.map((row) => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));
const tr = (a: M) => a[0].map((_, j) => a.map((row) => row[j]));
const add = (a: M, b: M) => a.map((row, i) => row.map((v, j) => v + b[i][j]));
const inv2 = (a: M) => { const d = a[0][0] * a[1][1] - a[0][1] * a[1][0]; return [[a[1][1] / d, -a[0][1] / d], [-a[1][0] / d, a[0][0] / d]]; };

/** Two effectors with integrator dynamics must reach x1 + x2 = 1. LQR with a task cost (optimal) or with separate costs on each effector (servo); 150 noisy movements each. */
export function MinimalIntervention() {
  const [noise, setNoise] = useState(0.02);
  const [mode, setMode] = useState<"optimal" | "servo">("optimal");
  const { ends, rel, irr } = useMemo(() => {
    const A: M = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], B: M = [[DT, 0], [0, DT], [0, 0]], R: M = [[1e-3, 0], [0, 1e-3]];
    const outer = (v: number[], c: number): M => v.map((a) => v.map((b) => c * a * b));
    const Qf = mode === "optimal" ? outer([1, 1, -1], 1e3) : add(outer([1, 0, -0.5], 1e3), outer([0, 1, -0.5], 1e3));
    let S = Qf; const Ks: M[] = [];
    for (let t = 0; t < T; t++) {
      const BtS = mul(tr(B), S), K = mul(inv2(add(R, mul(BtS, B))), mul(BtS, A));
      Ks.push(K); S = mul(mul(tr(A), S), add(A, mul(B, K).map((row) => row.map((v) => -v))));
    }
    Ks.reverse();
    const r = rng(2002), ends: [number, number][] = [];
    for (let k = 0; k < 150; k++) {
      let x = [0, 0, 1];
      for (let t = 0; t < T; t++) {
        const u = Ks[t].map((row) => -row.reduce((s, v, j) => s + v * x[j], 0));
        x = [x[0] + DT * u[0] + noise * gauss(r), x[1] + DT * u[1] + noise * gauss(r), 1];
      }
      ends.push([x[0], x[1]]);
    }
    const varOf = (f: (e: [number, number]) => number) => { const v = ends.map(f), m = v.reduce((a, b) => a + b, 0) / v.length; return v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length; };
    return { ends, rel: varOf((e) => e[0] + e[1]), irr: varOf((e) => e[0] - e[1]) };
  }, [noise, mode]);
  const W = 300, sc = (v: number) => 20 + v * 260;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${mode === "optimal" ? "btn-primary" : ""}`} onClick={() => setMode("optimal")}>optimal (task cost)</button>
        <button className={`btn !py-1.5 ${mode === "servo" ? "btn-primary" : ""}`} onClick={() => setMode("servo")}>servo (each effector)</button>
      </div>
      <svg viewBox={`0 0 ${W} ${W}`} className="mx-auto w-full max-w-[340px] rounded-lg bg-surface-2" role="img" aria-label="End points of two effectors">
        <line x1={sc(0)} y1={W - sc(1)} x2={sc(1)} y2={W - sc(0)} stroke="var(--ink-3)" strokeDasharray="4 3" />
        <text x={sc(0.62)} y={W - sc(0.42)} fontSize="9" fill="var(--ink-3)">x1 + x2 = 1</text>
        {ends.map(([a, b], i) => <circle key={i} cx={sc(a)} cy={W - sc(b)} r="2.2" fill={mode === "optimal" ? "var(--ai)" : "var(--neuro)"} opacity="0.6" />)}
        <circle cx={sc(0.5)} cy={W - sc(0.5)} r="3" fill="none" stroke="var(--ink)" />
        <text x="22" y={W - 6} fontSize="9" fill="var(--ink-3)">x1 (0 to 1)</text>
      </svg>
      <Slider label="noise per step" value={noise} min={0.005} max={0.05} step={0.005} onChange={setNoise} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="variance along the task" value={rel.toFixed(4)} />
        <Stat label="variance across it" value={irr.toFixed(4)} />
        <Stat label="ratio" value={`${(irr / rel).toFixed(0)}×`} />
      </div>
      <p className="text-sm text-ink-2">Each dot is where the two effectors ended in one noisy movement. The optimal controller only cares about their sum, so the dots spread along the dashed line, where the task is still achieved; the servo controller drives each effector to 0.5 and the dots form a small round cloud, at the cost of extra effort. Both are equally accurate on the task.</p>
    </div>
  );
}
