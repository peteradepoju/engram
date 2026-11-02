"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const INPUTS = ["step", "pulses", "noisy"] as const;

/** A leaky integrator (RC membrane) driven by an input current, with an optional threshold and reset. */
export function LeakyIntegrator() {
  const [tau, setTau] = useState(20);
  const [kind, setKind] = useState<(typeof INPUTS)[number]>("pulses");
  const [spiking, setSpiking] = useState(false);
  const noise = useMemo(() => { const r = rng(21), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r()); return Array.from({ length: 2000 }, g); }, []);
  const dt = 0.1, n = 2000;   // 200 ms in 0.1 ms steps
  const I = (k: number) => {
    const t = k * dt;
    if (kind === "step") return t > 20 && t < 150 ? 22 : 0;
    if (kind === "pulses") return [30, 45, 60, 110, 115, 120, 125].some((p) => t >= p && t < p + 2) ? 90 : 0;
    return t > 20 ? 18 + 25 * noise[k] : 0;
  };
  const V: number[] = [0], spikes: number[] = [];
  for (let k = 1; k < n; k++) {
    // Exact update for constant input over a step: V relaxes towards I with time constant tau.
    let v = I(k) + (V[k - 1] - I(k)) * Math.exp(-dt / tau);
    if (spiking && v >= 15) { spikes.push(k * dt); v = 0; }
    V.push(v);
  }
  const W = 540, H = 250, X = (t: number) => 40 + (t / 200) * (W - 60), Yv = (v: number) => 150 - v * 3.8, Yi = (i: number) => 235 - Math.min(i, 120) * 0.45;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {INPUTS.map((k) => <button key={k} className={`btn !py-1.5 ${kind === k ? "btn-primary" : ""}`} onClick={() => setKind(k)}>{k} input</button>)}
        <button className={`btn !py-1.5 ${spiking ? "btn-primary" : ""}`} onClick={() => setSpiking(!spiking)}>{spiking ? "threshold and reset on" : "add threshold and reset"}</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Membrane potential of a leaky integrator">
        <line x1="40" x2={W - 20} y1={Yv(0)} y2={Yv(0)} stroke="var(--line)" />
        {spiking ? <line x1="40" x2={W - 20} y1={Yv(15)} y2={Yv(15)} stroke="var(--bad)" strokeDasharray="4 4" /> : null}
        <polyline points={V.map((v, k) => `${X(k * dt)},${Yv(Math.min(v, 34))}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {spikes.map((t, i) => <line key={i} x1={X(t)} x2={X(t)} y1={Yv(15)} y2={Yv(24)} stroke="var(--accent)" strokeWidth="2" />)}
        <polyline points={Array.from({ length: n }, (_, k) => `${X(k * dt)},${Yi(I(k))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1" />
        {[0, 50, 100, 150, 200].map((t) => <text key={t} x={X(t)} y={H - 2} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{t} ms</text>)}
        <text x="44" y="16" fontSize="10" fill="var(--ink-3)">membrane potential above rest (mV); input current below (grey)</text>
      </svg>
      <Slider label="membrane time constant τ" value={tau} min={2} max={80} step={1} onChange={setTau} unit="ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="spikes in 200 ms" value={spiking ? String(spikes.length) : "threshold off"} />
        <Stat label="fraction of a pulse left after 20 ms" value={Math.exp(-20 / tau).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The membrane solves τ dV/dt = −V + RI: it integrates its input and leaks back to rest with time constant τ. With pulses, a short τ forgets each pulse before the next arrives, while a long τ lets closely spaced pulses add up: the neuron becomes a coincidence detector or an integrator depending on τ. Add a threshold and reset and you have the integrate-and-fire neuron of Lapicque.</p>
    </div>
  );
}
