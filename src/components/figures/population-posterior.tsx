"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Poisson population responses and the posterior they encode, with optional second population. */
export function PopulationPosterior() {
  const [g1, setG1] = useState(3);
  const [g2, setG2] = useState(0);
  const [seed, setSeed] = useState(1);
  const pref = useMemo(() => Array.from({ length: 41 }, (_, i) => -90 + i * 4.5), []);
  const grid = useMemo(() => Array.from({ length: 361 }, (_, i) => -45 + i * 0.25), []);
  const res = useMemo(() => {
    const r = rng(seed * 101 + 7);
    const pois = (lam: number) => { const L = Math.exp(-lam); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; };
    const resp = (g: number) => pref.map((p) => (g > 0 ? pois(g * Math.exp(-((5 - p) ** 2) / (2 * 225)) + 0.1) : 0));
    const r1 = resp(g1), r2 = resp(g2), rs = r1.map((v, i) => v + r2[i]);
    const post = (cnt: number[]) => { const lp = grid.map((s) => cnt.reduce((acc, c, i) => acc - (c * (s - pref[i]) ** 2) / 450, 0)); const m = Math.max(...lp); const e = lp.map((v) => Math.exp(v - m)); const z = e.reduce((a, b) => a + b, 0); return e.map((v) => v / z); };
    const stats = (p: number[]) => { const m = p.reduce((a, v, i) => a + v * grid[i], 0); return [m, Math.sqrt(p.reduce((a, v, i) => a + v * (grid[i] - m) ** 2, 0))]; };
    const p1 = post(r1), pc = post(rs);
    return { r1, r2, p1, pc, s1: stats(p1), sc: stats(pc) };
  }, [g1, g2, seed, pref, grid]);
  const maxR = Math.max(...res.r1.map((v, i) => v + res.r2[i]), 1), maxP = Math.max(...res.pc, ...res.p1);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Population response and posterior">
        {res.r1.map((v, i) => <rect key={`a${i}`} x={12 + i * 3.8} y={160 - (v / maxR) * 120} width="3" height={(v / maxR) * 120} fill="var(--neuro)" />)}
        {res.r2.map((v, i) => <rect key={`b${i}`} x={12 + i * 3.8} y={160 - ((v + res.r1[i]) / maxR) * 120} width="3" height={(v / maxR) * 120} fill="var(--ai)" />)}
        <text x="12" y="172" fontSize="8" fill="var(--ink-3)">spike counts by preferred stimulus</text>
        <polyline points={grid.map((s, i) => `${190 + ((s + 45) / 90) * 160},${160 - (res.p1[i] / maxP) * 130}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
        {g2 > 0 && <polyline points={grid.map((s, i) => `${190 + ((s + 45) / 90) * 160},${160 - (res.pc[i] / maxP) * 130}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="2" />}
        <line x1={190 + (50 / 90) * 160} x2={190 + (50 / 90) * 160} y1="25" y2="160" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x="350" y="172" fontSize="8" textAnchor="end" fill="var(--ink-3)">posterior over the stimulus</text>
      </svg>
      <Slider label="gain of population 1" value={g1} min={0.5} max={20} step={0.5} onChange={setG1} fmt={(v) => v.toFixed(1)} />
      <Slider label="gain of population 2 (0 = off)" value={g2} min={0} max={20} step={0.5} onChange={setG2} fmt={(v) => v.toFixed(1)} />
      <Slider label="trial" value={seed} min={1} max={30} step={1} onChange={setSeed} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="posterior sd, population 1" value={res.s1[1].toFixed(2)} />
        <Stat label="posterior sd, summed" value={g2 > 0 ? res.sc[1].toFixed(2) : "add population 2"} />
      </div>
      <p className="text-sm text-ink-2">The true stimulus is 5 (dashed line). Pink bars and curve are population 1 alone; blue bars are population 2, and the black curve is the posterior read from the summed counts, narrower than either.</p>
    </div>
  );
}
