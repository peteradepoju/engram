"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Responses of a Tsodyks-Markram synapse to ten spikes at a fixed rate (Markram, Wang and Tsodyks 1998 formulation, with facilitation when τ_F is above zero). */
export function tmTrain(U: number, tauD: number, tauF: number, f: number, n = 10) {
  const dt = 1000 / f, out: number[] = [];
  let u = U, x = 1;
  for (let k = 0; k < n; k++) {
    out.push(u * x);
    const xAfter = x - u * x;
    x = 1 + (xAfter - 1) * Math.exp(-dt / tauD);
    u = tauF > 0 ? U + u * (1 - U) * Math.exp(-dt / tauF) : U;
  }
  return out;
}

export function TMSynapse() {
  const [U, setU] = useState(0.5);
  const [tauD, setTauD] = useState(800);
  const [tauF, setTauF] = useState(0);
  const [f, setF] = useState(20);
  const a = tmTrain(U, tauD, tauF, f);
  const amax = Math.max(...a, 1e-9);
  const W = 360, H = 180, x0 = 20, bw = 26;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="btn !py-1.5" onClick={() => { setU(0.5); setTauD(800); setTauF(0); }}>depressing</button>
        <button className="btn !py-1.5" onClick={() => { setU(0.05); setTauD(100); setTauF(1000); }}>facilitating</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Bar chart of synaptic responses to a spike train">
        {a.map((v, i) => <rect key={i} x={x0 + i * (bw + 8)} y={160 - (v / amax) * 140} width={bw} height={(v / amax) * 140} rx="3" fill={tauF > 0 ? "var(--ai)" : "var(--neuro)"} />)}
        {a.map((_, i) => <text key={i} x={x0 + i * (bw + 8) + bw / 2} y={174} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{i + 1}</text>)}
        <text x={W - 6} y={14} fontSize="9" textAnchor="end" fill="var(--ink-3)">response to each spike (scaled to the largest)</text>
      </svg>
      <Slider label="release fraction U" value={U} min={0.02} max={0.9} step={0.01} onChange={setU} fmt={(v) => v.toFixed(2)} />
      <Slider label="recovery time τ_rec" value={tauD} min={20} max={1500} step={10} onChange={setTauD} unit="ms" />
      <Slider label="facilitation time τ_F (0 = none)" value={tauF} min={0} max={1500} step={10} onChange={setTauF} unit="ms" />
      <Slider label="input rate" value={f} min={1} max={100} step={1} onChange={setF} unit="Hz" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="tenth / first" value={(a[9] / a[0]).toFixed(2)} />
        <Stat label="second / first" value={(a[1] / a[0]).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With a high release fraction and no facilitation, each spike uses up resources the next one needs, and responses fall. With a low release fraction and slow facilitation, each spike raises the release fraction for the next, and responses grow before depletion catches up. Lower the rate and both effects fade, because the synapse has time to recover between spikes.</p>
    </div>
  );
}
