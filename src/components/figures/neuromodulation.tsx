"use client";

import { useMemo, useState } from "react";
import { tmTrain } from "./tm-synapse";
import { Slider, Stat } from "./util";

function alifRate(I: number, ga: number) {
  const dt = 0.1, T = 1500, C = 200, gL = 10, EL = -70, Vth = -50, Vr = -60, Ew = -80, tw = 150;
  let V = EL, g = 0, n = 0;
  for (let k = 0; k * dt < T; k++) {
    V += (dt * (-gL * (V - EL) - g * (V - Ew) + I)) / C; g -= (dt * g) / tw;
    if (V >= Vth) { V = Vr; g += ga; n++; }
  }
  return n / (T / 1000);
}

const CURRENTS = [200, 300, 400, 500, 600];

/** Left: a depressing synapse (τ_rec = 800 ms) driven at 20 Hz, control U = 0.5 outlined, modulated U filled. Right: f-I curves of an adapting LIF neuron, control adaptation and modulated. */
export function Neuromodulation() {
  const [U, setU] = useState(0.2);
  const [ga, setGa] = useState(0.3);
  const ctrl = tmTrain(0.5, 800, 0, 20, 12), mod = tmTrain(U, 800, 0, 20, 12);
  const fiC = useMemo(() => CURRENTS.map((I) => alifRate(I, 1)), []);
  const fiM = useMemo(() => CURRENTS.map((I) => alifRate(I, ga)), [ga]);
  const W = 360, H = 190, base = 165;
  const amax = Math.max(...ctrl, ...mod);
  const fmax = Math.max(...fiC, ...fiM, 1);
  const Xf = (I: number) => 205 + ((I - 200) / 400) * 140, Yf = (f: number) => base - (f / fmax) * 140;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Synaptic responses and f-I curves with and without a neuromodulator">
        <text x="10" y="14" fontSize="9" fill="var(--ink-3)">synapse at 20 Hz</text>
        {mod.map((v, i) => <rect key={`m${i}`} x={10 + i * 14} y={base - (v / amax) * 140} width="10" height={(v / amax) * 140} fill="var(--ai)" />)}
        {ctrl.map((v, i) => <rect key={`c${i}`} x={10 + i * 14} y={base - (v / amax) * 140} width="10" height={(v / amax) * 140} fill="none" stroke="var(--ink-3)" />)}
        <text x="10" y={H - 8} fontSize="9" fill="var(--ink-3)">outline: control</text>
        <text x="205" y="14" fontSize="9" fill="var(--ink-3)">f-I curve</text>
        <polyline points={CURRENTS.map((I, i) => `${Xf(I)},${Yf(fiC[i])}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeDasharray="4 3" />
        <polyline points={CURRENTS.map((I, i) => `${Xf(I)},${Yf(fiM[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.2" />
        {CURRENTS.map((I, i) => <circle key={I} cx={Xf(I)} cy={Yf(fiM[i])} r="2.5" fill="var(--neuro)" />)}
        <text x="205" y={H - 8} fontSize="9" fill="var(--ink-3)">200 to 600 pA</text>
      </svg>
      <Slider label="release fraction under the modulator" value={U} min={0.05} max={0.9} step={0.01} onChange={setU} fmt={(v) => v.toFixed(2)} />
      <Slider label="adaptation strength (1 = control)" value={ga} min={0} max={2} step={0.05} onChange={setGa} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="12th response, modulated / control" value={(mod[11] / ctrl[11]).toFixed(2)} />
        <Stat label="rate at 600 pA" value={`${fiM[4].toFixed(0)} Hz (control ${fiC[4].toFixed(0)})`} />
      </div>
      <p className="text-sm text-ink-2">Lowering release shrinks the first response but leaves more resources for later spikes, so the synapse passes a sustained train more evenly. Weakening adaptation, as acetylcholine does by closing the M-current, steepens the f-I curve. Neither change touches the wiring.</p>
    </div>
  );
}
