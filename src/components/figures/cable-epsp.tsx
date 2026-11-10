"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

export function solveTri(lower: number[], diag: number[], upper: number[], rhs: number[]) {
  const n = diag.length, c = new Array(n).fill(0), d = new Array(n).fill(0), x = new Array(n).fill(0);
  c[0] = upper[0] / diag[0]; d[0] = rhs[0] / diag[0];
  for (let i = 1; i < n; i++) {
    const m = diag[i] - lower[i - 1] * c[i - 1];
    c[i] = i < n - 1 ? upper[i] / m : 0;
    d[i] = (rhs[i] - lower[i - 1] * d[i - 1]) / m;
  }
  x[n - 1] = d[n - 1];
  for (let i = n - 2; i >= 0; i--) x[i] = d[i] - c[i] * x[i + 1];
  return x;
}

/** Passive 2 μm dendrite two length constants long (sealed ends): a 0.5 ms, 0.5 nA current injected at a chosen distance, voltage recorded there and at the soma end (x = 0). */
export function CableEPSP() {
  const [site, setSite] = useState(1);
  const N = 100;
  const { local, soma } = useMemo(() => {
    const rm = 20000, ri = 150, cm = 1e-6, d = 2e-4, lam = Math.sqrt((rm * d) / (4 * ri)), L = 2 * lam, dx = L / N, dt = 0.05e-3;
    const ga = (Math.PI * d * d) / (4 * ri * dx), gm = (Math.PI * d * dx) / rm, cmp = Math.PI * d * dx * cm;
    const diag = new Array(N).fill(cmp / dt + gm + 2 * ga); diag[0] -= ga; diag[N - 1] -= ga;
    const off = new Array(N - 1).fill(-ga);
    const k = Math.min(N - 1, Math.round((site / 2) * (N - 1)));
    let V = new Array(N).fill(0);
    const local: number[] = [], soma: number[] = [];
    for (let s = 0; s * dt < 40e-3; s++) {
      const rhs = V.map((v) => (cmp / dt) * v);
      if (s * dt < 0.5e-3) rhs[k] += 0.5e-9;
      V = solveTri(off, diag, off, rhs);
      local.push(V[k] * 1e3); soma.push(V[0] * 1e3);
    }
    return { local, soma };
  }, [site]);
  const pk = (a: number[]) => { let m = 0, i = 0; a.forEach((v, j) => { if (v > m) { m = v; i = j; } }); return { m, t: i * 0.05 }; };
  const pl = pk(local), ps = pk(soma);
  const W = 360, H = 190, x0 = 34, x1 = 350, y0 = 12, y1 = 176;
  const X = (i: number) => x0 + (i / (local.length - 1)) * (x1 - x0);
  const Yl = (v: number) => y1 - (v / Math.max(pl.m, 1e-9)) * (y1 - y0);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Voltage at the injection site and at the soma end of a dendrite">
        <line x1={x0} x2={x1} y1={y1} y2={y1} stroke="var(--line)" />
        <polyline points={local.map((v, i) => `${X(i)},${Yl(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={soma.map((v, i) => `${X(i)},${y1 - (v / Math.max(ps.m, 1e-9)) * (y1 - y0) * 0.9}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x={x1} y={y0 + 8} fontSize="9" textAnchor="end" fill="var(--neuro)">at the synapse (scaled to its peak)</text>
        <text x={x1} y={y0 + 20} fontSize="9" textAnchor="end" fill="var(--ai)">at the soma end (scaled to its peak)</text>
        <text x={x1} y={H - 2} fontSize="9" textAnchor="end" fill="var(--ink-3)">0 to 40 ms</text>
      </svg>
      <Slider label="distance of the synapse from the soma" value={site} min={0} max={2} step={0.05} onChange={setSite} unit="λ" fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="local peak" value={`${pl.m.toFixed(1)} mV`} />
        <Stat label="soma peak" value={`${ps.m.toFixed(2)} mV`} />
        <Stat label="soma time to peak" value={`${ps.t.toFixed(1)} ms`} />
      </div>
      <p className="text-sm text-ink-2">Both traces are scaled to their own peaks so their shapes can be compared; the numbers give the true sizes. A synapse at the soma gives a sharp response there. Move it out along the dendrite and the somatic response becomes small, late and broad, while the local response stays sharp. Near the sealed far end the local response grows, because the thin tip has a high input resistance.</p>
    </div>
  );
}
