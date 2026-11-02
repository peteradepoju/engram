"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat, poisson } from "./util";

/** The population vector: each neuron votes for its preferred direction, weighted by how much its rate rose above baseline. */
export function PopulationVector() {
  const [dir, setDir] = useState(40);
  const [n, setN] = useState(30);
  const [seed, setSeed] = useState(1);
  const rad = (d: number) => (d * Math.PI) / 180;
  const prefs = useMemo(() => { const r = rng(5); return Array.from({ length: 200 }, () => r() * 360); }, []);
  const { votes, est } = useMemo(() => {
    const r = rng(seed * 101 + 3);
    const b0 = 20, k = 15, T = 0.5;
    const v = prefs.slice(0, n).map((p) => {
      const rate = poisson((b0 + k * Math.cos(rad(dir - p))) * T, r) / T;
      const w = (rate - b0) / k;
      return { p, w };
    });
    const sx = v.reduce((s, q) => s + q.w * Math.cos(rad(q.p)), 0), sy = v.reduce((s, q) => s + q.w * Math.sin(rad(q.p)), 0);
    return { votes: v, est: { x: sx, y: sy } };
  }, [dir, n, seed, prefs]);
  const estDeg = ((Math.atan2(est.y, est.x) * 180) / Math.PI + 360) % 360;
  const err = Math.abs(((estDeg - dir + 540) % 360) - 180);
  const C = 150, R = 55;
  const L = Math.hypot(est.x, est.y) || 1;
  const scale = 110 / L;
  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] justify-self-center rounded-lg bg-surface-2" role="img" aria-label="Population vector built from neuron votes">
        <circle cx={C} cy={C} r="120" fill="none" stroke="var(--line)" />
        {votes.map((q, i) => (
          <line key={i} x1={C} y1={C} x2={C + q.w * R * Math.cos(rad(q.p))} y2={C - q.w * R * Math.sin(rad(q.p))}
            stroke={q.w >= 0 ? "var(--neuro)" : "var(--ink-3)"} strokeWidth="1.5" opacity="0.7" />
        ))}
        <line x1={C} y1={C} x2={C + 120 * Math.cos(rad(dir))} y2={C - 120 * Math.sin(rad(dir))} stroke="var(--ai)" strokeWidth="3" strokeDasharray="6 4" />
        <line x1={C} y1={C} x2={C + est.x * scale} y2={C - est.y * scale} stroke="var(--accent)" strokeWidth="4" />
        <circle cx={C} cy={C} r="3" fill="var(--ink)" />
      </svg>
      <div className="space-y-3">
        <p className="text-sm text-ink-2">Thin lines: each neuron&apos;s vote, along its preferred direction, scaled by its (noisy) rate change. Grey votes point backwards because that neuron fired below baseline. Dashed blue: the true movement. Thick violet: the sum of all votes.</p>
        <Slider label="Movement direction" value={dir} min={0} max={359} step={1} unit="°" onChange={setDir} />
        <Slider label="Number of neurons" value={n} min={2} max={200} step={1} onChange={setN} />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="decoded direction" value={`${estDeg.toFixed(0)}°`} />
          <Stat label="error" value={`${err.toFixed(1)}°`} />
        </div>
        <button className="btn" onClick={() => setSeed((s) => s + 1)}>New trial (new spike counts)</button>
      </div>
    </div>
  );
}
