"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const COLS = ["var(--neuro)", "var(--ai)", "var(--warn)"];

/** Lloyd's algorithm step by step: assign each point to its nearest centre, move each centre to its points' mean. */
export function KmeansSteps() {
  const [seed, setSeed] = useState(1);
  const [step, setStep] = useState(0);
  const pts = useMemo(() => {
    const r = rng(601), centres = [[-1.2, -0.6], [1.2, -0.5], [0, 1.2]];
    return Array.from({ length: 150 }, (_, i): number[] => { const c = centres[i % 3]; return [c[0] + 0.45 * gauss(r), c[1] + 0.45 * gauss(r)]; });
  }, []);
  const hist = useMemo(() => {
    const r = rng(100 + seed);
    let C = [0, 1, 2].map(() => pts[Math.floor(r() * pts.length)].slice());
    const out: { C: number[][]; lab: number[]; sse: number }[] = [];
    for (let it = 0; it <= 10; it++) {
      const lab = pts.map((p) => { let b = 0, bd = Infinity; C.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = k; } }); return b; });
      const sse = pts.reduce((s, p, i) => s + (p[0] - C[lab[i]][0]) ** 2 + (p[1] - C[lab[i]][1]) ** 2, 0);
      out.push({ C: C.map((c) => c.slice()), lab, sse });
      C = C.map((c, k) => { const m = pts.filter((_, i) => lab[i] === k); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; });
    }
    return out;
  }, [pts, seed]);
  const h = hist[step];
  const sx = (x: number): number => 170 + x * 60, sy = (y: number): number => 95 - y * 50;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 190" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="k-means iterations">
        {pts.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="2.6" fill={COLS[h.lab[i]]} opacity="0.75" />)}
        {h.C.map((c, k) => <g key={k}><circle cx={sx(c[0])} cy={sy(c[1])} r="7" fill="none" stroke="var(--ink)" strokeWidth="2.5" /><circle cx={sx(c[0])} cy={sy(c[1])} r="3" fill={COLS[k]} /></g>)}
      </svg>
      <Slider label="iteration" value={step} min={0} max={10} step={1} onChange={setStep} />
      <Slider label="random start" value={seed} min={1} max={12} step={1} onChange={(v) => { setSeed(v); setStep(0); }} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="within-cluster sum of squares" value={h.sse.toFixed(1)} />
        <Stat label="after 10 iterations" value={hist[10].sse.toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">Each iteration assigns points to the nearest centre (ringed) and then moves each centre to the mean of its points. The sum of squares can only fall, so the algorithm always converges, but some starts end in a worse solution, with two centres sharing one group. Try different starts.</p>
    </div>
  );
}
