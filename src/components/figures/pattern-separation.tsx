"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Input overlap against output overlap for random expansion plus k-winners-take-all. */
export function PatternSeparation() {
  const [kd, setKd] = useState(2);
  const NE = 200, ND = 1000, kE = 40;
  const W = useMemo(() => {
    const r = rng(2007);
    return Array.from({ length: ND }, () => Array.from({ length: NE }, (): number => (r() < 0.1 ? 1 : 0)));
  }, []);
  const pts = useMemo(() => {
    const r = rng(11), k = Math.max(1, Math.round((kd / 100) * ND));
    const kwta = (a: number[]) => {
      const h = W.map((row, i) => row.reduce((s, w, j) => s + w * a[j], 0) + 1e-6 * ((i * 7919) % 1000));
      const idx = h.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0] || x[1] - y[1]).slice(0, k).map((x) => x[1]);
      const out = new Array(ND).fill(0); idx.forEach((i) => (out[i] = 1)); return out;
    };
    const ov = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0) / Math.sqrt(a.reduce((s, v) => s + v, 0) * b.reduce((s, v) => s + v, 0));
    return [0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2].map((o) => {
      let tot = 0;
      for (let rep = 0; rep < 10; rep++) {
        const perm = Array.from({ length: NE }, (_, i) => i);
        for (let i = NE - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
        const on = perm.slice(0, kE), off = perm.slice(kE);
        const a = new Array(NE).fill(0); on.forEach((i) => (a[i] = 1));
        const b = a.slice(); const n = Math.round((1 - o) * kE);
        on.slice(0, n).forEach((i) => (b[i] = 0)); off.slice(0, n).forEach((i) => (b[i] = 1));
        tot += ov(kwta(a), kwta(b));
      }
      return [o, tot / 10];
    });
  }, [kd, W]);
  const S = 150, sx = (v: number) => 40 + v * S * 1.6, sy = (v: number) => 165 - v * S;
  const at09 = pts.find((p) => p[0] === 0.9)![1];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 185" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Pattern separation curve">
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(0)} stroke="var(--line)" />
        <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(1)} stroke="var(--line)" />
        <polyline points={pts.map(([o, v]) => `${sx(o)},${sy(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        {pts.map(([o, v]) => <circle key={o} cx={sx(o)} cy={sy(v)} r="2.5" fill="var(--neuro)" />)}
        <text x={sx(1)} y="180" fontSize="8" textAnchor="end" fill="var(--ink-3)">input overlap</text>
        <text x="36" y="18" fontSize="8" textAnchor="end" fill="var(--ink-3)">1</text>
        <text x="44" y="22" fontSize="8" fill="var(--ink-3)">output overlap</text>
        <text x={sx(0.75)} y={sy(0.82)} fontSize="8" fill="var(--ink-3)">no change</text>
      </svg>
      <Slider label="output cells allowed to fire" value={kd} min={1} max={30} step={1} onChange={setKd} unit="%" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="input overlap 0.9 becomes" value={at09.toFixed(2)} />
        <Stat label="active output cells" value={`${Math.round((kd / 100) * ND)} of ${ND}`} />
      </div>
      <p className="text-sm text-ink-2">200 input cells, 20% active, project randomly to 1,000 output cells, of which only the most strongly driven fire. Sparser output codes push the curve further below the diagonal.</p>
    </div>
  );
}
