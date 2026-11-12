"use client";

import { useMemo, useState } from "react";
import { rng, poisson, Slider, Stat } from "./util";

/** A simulated place cell: trajectory, spikes and occupancy-normalised rate map. */
export function PlaceField() {
  const [minutes, setMinutes] = useState(10);
  const [nb, setNb] = useState(16);
  const sim = useMemo(() => {
    const r = rng(1971), dt = 0.05, T = Math.round((minutes * 60) / dt);
    const xs: number[] = [], ys: number[] = [], sp: number[] = [];
    let x = 0.5, y = 0.5, hd = 0;
    for (let t = 0; t < T; t++) {
      const g = Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
      hd += 0.4 * g;
      const nx = x + 0.15 * dt * Math.cos(hd), ny = y + 0.15 * dt * Math.sin(hd);
      if (nx <= 0 || nx >= 1 || ny <= 0 || ny >= 1) hd += Math.PI; else { x = nx; y = ny; }
      xs.push(x); ys.push(y);
      const lam = 15 * Math.exp(-((x - 0.62) ** 2 + (y - 0.38) ** 2) / (2 * 0.08 ** 2));
      sp.push(poisson(lam * dt, r));
    }
    return { xs, ys, sp, dt };
  }, [minutes]);
  const { map, peak, visited } = useMemo(() => {
    const occ = new Array(nb * nb).fill(0), cnt = new Array(nb * nb).fill(0);
    sim.xs.forEach((x, i) => {
      const k = Math.min(nb - 1, Math.floor(x * nb)) * nb + Math.min(nb - 1, Math.floor(sim.ys[i] * nb));
      occ[k] += sim.dt; cnt[k] += sim.sp[i];
    });
    const map = occ.map((o, k) => (o > 0 ? cnt[k] / o : NaN));
    return { map, peak: Math.max(...map.filter((v) => isFinite(v))), visited: occ.filter((o) => o > 0).length / (nb * nb) };
  }, [sim, nb]);
  const S = 160, step = Math.max(1, Math.floor(sim.xs.length / 3000));
  const path = sim.xs.filter((_, i) => i % step === 0).map((x, j) => `${10 + x * S},${10 + (1 - sim.ys[j * step]) * S}`).join(" ");
  const c = S / nb;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Place cell trajectory and rate map">
        <rect x="10" y="10" width={S} height={S} fill="none" stroke="var(--line)" />
        <polyline points={path} fill="none" stroke="var(--ink-3)" strokeWidth="0.3" opacity="0.6" />
        {sim.sp.map((n, i) => (n > 0 ? <circle key={i} cx={10 + sim.xs[i] * S} cy={10 + (1 - sim.ys[i]) * S} r="1.1" fill="var(--neuro)" /> : null))}
        {map.map((v, k) => {
          const ix = Math.floor(k / nb), iy = k % nb;
          return <rect key={k} x={190 + ix * c} y={10 + (nb - 1 - iy) * c} width={c + 0.2} height={c + 0.2} fill={isFinite(v) ? "var(--ai)" : "var(--surface-2)"} opacity={isFinite(v) ? 0.08 + 0.92 * Math.min(1, v / peak) : 1} />;
        })}
        <rect x="190" y="10" width={S} height={S} fill="none" stroke="var(--line)" />
      </svg>
      <Slider label="session length" value={minutes} min={2} max={30} step={1} onChange={setMinutes} unit="min" />
      <Slider label="bins per side" value={nb} min={5} max={40} step={1} onChange={setNb} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak rate in map" value={`${peak.toFixed(1)} Hz`} />
        <Stat label="bins visited" value={`${Math.round(visited * 100)}%`} />
      </div>
      <p className="text-sm text-ink-2">The true field peaks at 15 Hz. With short sessions or small bins, rarely visited bins produce spuriously high rates and holes; with large bins the field is blurred. The usual compromise is bins of a few centimetres plus light smoothing.</p>
    </div>
  );
}
