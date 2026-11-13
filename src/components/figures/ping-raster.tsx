"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** A small PING network: spike raster and excitatory population rate. */
export function PINGRaster() {
  const [tauI, setTauI] = useState(8);
  const [drive, setDrive] = useState(2.2);
  const sim = useMemo(() => {
    const r = rng(2003), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const NE = 100, NI = 25, dt = 0.1, T = 300, p = 0.2;
    const conn = (a: number, b: number, w: number) => Array.from({ length: a }, () => Array.from({ length: b }, () => (r() < p ? w : 0)));
    const WEI = conn(NI, NE, 1.2), WIE = conn(NE, NI, 4.8), WII = conn(NI, NI, 1.6);
    const vE = Array.from({ length: NE }, () => r()), vI = Array.from({ length: NI }, () => r());
    const xE = new Array(NI).fill(0), xIE = new Array(NE).fill(0), xII = new Array(NI).fill(0);
    const spE: [number, number][] = [], spI: [number, number][] = [], rate = new Array(Math.round(T / 2)).fill(0);
    for (let k = 0; k < T / dt; k++) {
      const fE: number[] = [], fI: number[] = [];
      for (let i = 0; i < NE; i++) { vE[i] += (dt / 10) * (-vE[i] + drive - xIE[i]) + 0.05 * Math.sqrt(dt) * g(); if (vE[i] >= 1) { vE[i] = 0; fE.push(i); } }
      for (let i = 0; i < NI; i++) { vI[i] += (dt / 10) * (-vI[i] + 0.5 + xE[i] - xII[i]) + 0.05 * Math.sqrt(dt) * g(); if (vI[i] >= 1) { vI[i] = 0; fI.push(i); } }
      for (let i = 0; i < NI; i++) { xE[i] += (-dt * xE[i]) / 2; for (const j of fE) xE[i] += WEI[i][j]; xII[i] += (-dt * xII[i]) / tauI; for (const j of fI) xII[i] += WII[i][j]; }
      for (let i = 0; i < NE; i++) { xIE[i] += (-dt * xIE[i]) / tauI; for (const j of fI) xIE[i] += WIE[i][j]; }
      const t = k * dt; fE.forEach((i) => spE.push([t, i])); fI.forEach((i) => spI.push([t, i]));
      rate[Math.min(rate.length - 1, Math.floor(t / 2))] += fE.length / NE / 0.002;
    }
    const x = rate.slice(25).map((v, _, a) => v - a.reduce((s, q) => s + q, 0) / a.length);
    let best = 0, bf = 0;
    for (let f = 15; f <= 150; f += 1) { let re = 0, im = 0; x.forEach((v, i) => { re += v * Math.cos(2 * Math.PI * f * i * 0.002); im += v * Math.sin(2 * Math.PI * f * i * 0.002); }); const P = re * re + im * im; if (P > best) { best = P; bf = f; } }
    return { spE, spI, rate, bf };
  }, [tauI, drive]);
  const W = 360, sx = (t: number) => 20 + (t / 300) * 330, rmax = Math.max(...sim.rate, 1);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 190`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="PING network raster">
        {sim.spE.map(([t, i], k) => <rect key={`e${k}`} x={sx(t)} y={10 + i * 1.0} width="1.4" height="1.4" fill="var(--neuro)" />)}
        {sim.spI.map(([t, i], k) => <rect key={`i${k}`} x={sx(t)} y={113 + i * 1.0} width="1.6" height="1.6" fill="var(--ai)" />)}
        <polyline points={sim.rate.map((v, i) => `${sx(i * 2 + 1)},${182 - (v / rmax) * 40}`).join(" ")} fill="none" stroke="var(--ink-2)" strokeWidth="1" />
        <text x="350" y="187" fontSize="7" textAnchor="end" fill="var(--ink-3)">300 ms</text>
      </svg>
      <Slider label="inhibitory decay time τ_I" value={tauI} min={2} max={20} step={1} onChange={setTauI} unit=" ms" />
      <Slider label="drive to excitatory cells" value={drive} min={1.2} max={3.5} step={0.1} onChange={setDrive} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="peak frequency" value={`${sim.bf} Hz`} />
        <Stat label="E spikes shown" value={String(sim.spE.length)} />
      </div>
      <p className="text-sm text-ink-2">A smaller network than in the lesson, with stronger synapses to compensate. Excitatory volleys (pink) are followed within a few milliseconds by inhibitory volleys (blue). Slower inhibition lengthens the silent gaps between volleys.</p>
    </div>
  );
}
