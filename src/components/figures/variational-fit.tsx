"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Fit a single Gaussian to a two-peaked distribution by minimising KL(q || p) (variational inference) or KL(p || q). */
export function VariationalFit() {
  const [sep, setSep] = useState(5);
  const xs = Array.from({ length: 401 }, (_, i) => -8 + (i / 400) * 16), dx = 16 / 400;
  const p = useMemo(() => { const v = xs.map((x) => 0.6 * Math.exp(-((x + sep / 2) ** 2) / 2) + 0.4 * Math.exp(-((x - sep / 2) ** 2) / 2)); const s = v.reduce((a, b) => a + b, 0) * dx; return v.map((u) => u / s); }, [sep]); // eslint-disable-line react-hooks/exhaustive-deps
  const gauss = (m: number, s: number) => xs.map((x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI)));
  const kl = (a: number[], b: number[]) => a.reduce((t, ai, i) => t + (ai > 1e-12 ? ai * Math.log(ai / Math.max(b[i], 1e-300)) : 0), 0) * dx;
  const fits = useMemo(() => {
    let rev = { m: 0, s: 1, v: Infinity }, fwd = { m: 0, s: 1, v: Infinity };
    for (let m = -5; m <= 5; m += 0.05) for (let s = 0.4; s <= 4; s += 0.05) {
      const q = gauss(m, s);
      const r1 = kl(q, p); if (r1 < rev.v) rev = { m, s, v: r1 };
      const f1 = kl(p, q); if (f1 < fwd.v) fwd = { m, s, v: f1 };
    }
    return { rev, fwd };
  }, [p]); // eslint-disable-line react-hooks/exhaustive-deps
  const qr = gauss(fits.rev.m, fits.rev.s), qf = gauss(fits.fwd.m, fits.fwd.s);
  const top = Math.max(...p, ...qr, ...qf) * 1.1;
  const W = 360, H = 190, X = (x: number) => 14 + ((x + 8) / 16) * (W - 24), Y = (v: number) => H - 26 - (v / top) * (H - 40);
  const line = (v: number[]) => xs.map((x, i) => `${X(x)},${Y(v[i])}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Two Gaussian approximations to a two-peaked distribution">
        <polyline points={line(p)} fill="none" stroke="var(--ink-2)" strokeWidth="2.5" />
        <polyline points={line(qr)} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={line(qf)} fill="none" stroke="var(--ai)" strokeWidth="2" strokeDasharray="5 3" />
        <line x1="14" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        <text x="14" y={H + 8} fontSize="10" fill="var(--ink-2)">target p</text>
        <text x="80" y={H + 8} fontSize="10" fill="var(--neuro)">min KL(q‖p): variational</text>
        <text x="230" y={H + 8} fontSize="10" fill="var(--ai)">min KL(p‖q)</text>
      </svg>
      <Slider label="separation of the two peaks" value={sep} min={0} max={8} step={0.1} onChange={setSep} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="variational fit: mean, sd" value={`${fits.rev.m.toFixed(2)}, ${fits.rev.s.toFixed(2)}`} />
        <Stat label="KL(p‖q) fit: mean, sd" value={`${fits.fwd.m.toFixed(2)}, ${fits.fwd.s.toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">The best single Gaussian depends on which way round you measure the mismatch. Variational inference minimises KL(q‖p), which punishes q for putting probability where p has none, so q locks onto one peak and underestimates the uncertainty. Minimising KL(p‖q) punishes q for missing probability that p has, so q stretches to cover both peaks, putting much of its mass in the valley between them. When the peaks merge, the two fits agree.</p>
    </div>
  );
}
