"use client";

import { useEffect, useRef, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The Kuramoto model: N oscillators with spread natural frequencies, coupled with strength K. Watch them lock as K passes the critical value. */
export function KuramotoSync() {
  const [K, setK] = useState(1.5);
  const N = 60;
  const init = () => { const r = rng(1975); const g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r()); return { th: Array.from({ length: N }, () => r() * 2 * Math.PI), om: Array.from({ length: N }, () => 0.5 * g()) }; };
  const state = useRef(init());
  const [, tick] = useState(0);
  const hist = useRef<number[]>([]);
  useEffect(() => {
    const id = setInterval(() => {
      const { th, om } = state.current;
      for (let s = 0; s < 4; s++) {
        let cx = 0, sy = 0; for (const t of th) { cx += Math.cos(t); sy += Math.sin(t); }
        const R = Math.hypot(cx, sy) / N, psi = Math.atan2(sy, cx);
        for (let i = 0; i < N; i++) th[i] += 0.05 * (om[i] + K * R * Math.sin(psi - th[i]));
      }
      let cx = 0, sy = 0; for (const t of th) { cx += Math.cos(t); sy += Math.sin(t); }
      hist.current = [...hist.current.slice(-149), Math.hypot(cx, sy) / N];
      tick((x) => x + 1);
    }, 50);
    return () => clearInterval(id);
  }, [K]);
  const { th } = state.current;
  let cx = 0, sy = 0; for (const t of th) { cx += Math.cos(t); sy += Math.sin(t); }
  const R = Math.hypot(cx, sy) / N, psi = Math.atan2(sy, cx);
  const W = 360, H = 180, ox = 90, oy = 90, rad = 70;
  const Kc = 2 / (Math.PI * (1 / (0.5 * Math.sqrt(2 * Math.PI))));   // 2 / (π g(0)) for a normal with sd 0.5
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Oscillators as dots on a circle and the order parameter over time">
        <circle cx={ox} cy={oy} r={rad} fill="none" stroke="var(--line)" />
        {th.map((t, i) => <circle key={i} cx={ox + rad * Math.cos(t)} cy={oy - rad * Math.sin(t)} r="3.5" fill="var(--neuro)" opacity="0.8" />)}
        <line x1={ox} y1={oy} x2={ox + rad * R * Math.cos(psi)} y2={oy - rad * R * Math.sin(psi)} stroke="var(--ai)" strokeWidth="3" />
        <rect x="180" y="20" width="170" height="140" fill="none" stroke="var(--line)" />
        <polyline points={hist.current.map((v, i) => `${180 + (i / 149) * 170},${160 - v * 140}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="184" y="34" fontSize="10" fill="var(--ai)">order parameter R</text>
        <text x="346" y="174" fontSize="9" textAnchor="end" fill="var(--ink-3)">time</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Slider label="coupling K" value={K} min={0} max={3} step={0.05} onChange={setK} />
        <button className="rounded-lg bg-surface-2 px-3 py-2 text-sm" onClick={() => { state.current = init(); hist.current = []; }}>scatter again</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="order parameter R" value={R.toFixed(2)} />
        <Stat label="critical coupling (large N)" value={Kc.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Each dot is an oscillator moving round the circle at its own natural frequency. Each is pulled towards the mean phase with strength K times R, the length of the arrow, which measures how synchronised the group is. Below the critical coupling the dots drift apart and R stays small; above it a cluster forms, locks, and recruits more oscillators as K grows.</p>
    </div>
  );
}
