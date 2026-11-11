"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Facilitation u, resources x and efficacy u·x after a loading burst (20 spikes at 50 Hz, ending at 0.4 s), with optional regular reactivation spikes afterwards. U = 0.2, τ_rec = 200 ms. */
export function MemoryTrace() {
  const [tauF, setTauF] = useState(1500);
  const [rate, setRate] = useState(0);
  const U = 0.2, tauD = 200, T = 5000;
  const { us, xs, es } = useMemo(() => {
    const spikes = new Set<number>();
    for (let i = 0; i < 20; i++) spikes.add(i * 20);
    if (rate > 0) for (let t = 380 + 1000 / rate; t < T; t += 1000 / rate) spikes.add(Math.round(t));
    let u = U, x = 1;
    const us: number[] = [], xs: number[] = [], es: number[] = [];
    const eD = Math.exp(-1 / tauD), eF = Math.exp(-1 / tauF);
    for (let t = 0; t < T; t++) {
      x = 1 + (x - 1) * eD; u = U + (u - U) * eF;
      if (spikes.has(t)) { x -= u * x; u += U * (1 - u); }
      if (t % 10 === 0) { us.push(u); xs.push(x); es.push((u * x) / U); }
    }
    return { us, xs, es };
  }, [tauF, rate]);
  const W = 360, H = 210, x0 = 30, x1 = 350, y0 = 12, y1 = 190;
  const X = (i: number) => x0 + (i / (us.length - 1)) * (x1 - x0);
  const Yf = (v: number) => y1 - v * (y1 - y0);
  const emax = Math.max(4, ...es);
  const Ye = (v: number) => y1 - (v / emax) * (y1 - y0);
  const at = (ms: number) => es[Math.min(es.length - 1, Math.round(ms / 10))];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Facilitation, resources and efficacy after a loading burst">
        <rect x={x0} y={y0} width={X(40) - x0} height={y1 - y0} fill="var(--neuro)" opacity="0.12" />
        <text x={x0 + 2} y={y0 + 10} fontSize="9" fill="var(--neuro)">load</text>
        <polyline points={us.map((v, i) => `${X(i)},${Yf(v)}`).join(" ")} fill="none" stroke="var(--warn)" strokeWidth="1.5" />
        <polyline points={xs.map((v, i) => `${X(i)},${Yf(v)}`).join(" ")} fill="none" stroke="var(--good)" strokeWidth="1.5" />
        <polyline points={es.map((v, i) => `${X(i)},${Ye(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.4" />
        <line x1={x0} x2={x1} y1={Ye(1)} y2={Ye(1)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={x1} y={Ye(1) - 3} fontSize="9" textAnchor="end" fill="var(--ink-3)">baseline efficacy</text>
        <text x={x1} y={y0 + 8} fontSize="9" textAnchor="end" fill="var(--ai)">efficacy u·x / U</text>
        <text x={x1} y={y0 + 20} fontSize="9" textAnchor="end" fill="var(--warn)">u (0 to 1)</text>
        <text x={x1} y={y0 + 32} fontSize="9" textAnchor="end" fill="var(--good)">x (0 to 1)</text>
        <text x={x1} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">0 to 5 s</text>
      </svg>
      <Slider label="facilitation time constant τ_F" value={tauF} min={100} max={3000} step={50} onChange={setTauF} unit="ms" />
      <Slider label="reactivation rate after loading (0 = silent)" value={rate} min={0} max={5} step={0.5} onChange={setRate} unit="Hz" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="efficacy at 1.4 s" value={`${at(1400).toFixed(2)} × baseline`} />
        <Stat label="efficacy at 4.4 s" value={`${at(4400).toFixed(2)} × baseline`} />
      </div>
      <p className="text-sm text-ink-2">The loading burst depletes resources (x) and raises facilitation (u). Resources recover in a few hundred milliseconds, facilitation decays over seconds, so for a while the synapse is stronger than it was before: a memory held without spikes. Add occasional reactivations and the trace can be held indefinitely at low cost.</p>
    </div>
  );
}
