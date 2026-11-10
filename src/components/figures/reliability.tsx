"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const dt = 0.1, T = 1000;

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

function eifTrial(I: Float64Array, noise: number, seed: number) {
  const r = rng(seed), C = 200, gL = 10, EL = -65, VT = -52, DT = 1.5, Vr = -60;
  let v = EL, last = -1e9; const s: number[] = [];
  for (let k = 0; k < I.length; k++) {
    const t = k * dt; if (t - last < 2) continue;
    v += (dt * (-gL * (v - EL) + gL * DT * Math.exp(Math.min((v - VT) / DT, 20)) + I[k]) + noise * Math.sqrt(dt) * gauss(r)) / C;
    if (v > -30) { s.push(t); last = t; v = Vr; }
  }
  return s;
}

function gamma(a: number[], b: number[]) {
  if (!a.length || !b.length) return 0;
  const nc = a.filter((t) => b.some((u) => Math.abs(u - t) <= 2)).length, nu = b.length / T;
  return (nc - 2 * nu * 2 * a.length) / (0.5 * (a.length + b.length)) / (1 - 2 * nu * 2);
}

/** Ten trials of an EIF neuron with internal noise, driven by a constant current or a frozen fluctuating current with the same mean. */
export function Reliability() {
  const [mode, setMode] = useState<"constant" | "fluctuating">("fluctuating");
  const [noise, setNoise] = useState(30);
  const inputs = useMemo(() => {
    const n = Math.round(T / dt), r = rng(1995), fl = new Float64Array(n), dc = new Float64Array(n).fill(200);
    let x = 0; const a = Math.exp(-dt / 3), b = Math.sqrt(1 - a * a);
    for (let k = 0; k < n; k++) { x = a * x + b * gauss(r); fl[k] = 200 + 150 * x; }
    return { constant: dc, fluctuating: fl };
  }, []);
  const trials = useMemo(() => Array.from({ length: 10 }, (_, i) => eifTrial(inputs[mode], noise, 100 + i)), [inputs, mode, noise]);
  const g = useMemo(() => {
    let s = 0, c = 0;
    for (let i = 0; i < trials.length; i++) for (let j = 0; j < trials.length; j++) if (i !== j) { s += gamma(trials[i], trials[j]); c++; }
    return s / c;
  }, [trials]);
  const W = 360, H = 170, x0 = 10, x1 = 350;
  const X = (t: number) => x0 + (t / T) * (x1 - x0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["constant", "fluctuating"] as const).map((m) => <button key={m} className={`btn !py-1.5 ${mode === m ? "btn-primary" : ""}`} onClick={() => setMode(m)}>{m} input</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Raster of spike times across ten trials">
        {trials.map((s, i) => s.map((t, j) => <line key={`${i}-${j}`} x1={X(t)} x2={X(t)} y1={12 + i * 15} y2={22 + i * 15} stroke="var(--neuro)" strokeWidth="1.5" />))}
        <text x={x1} y={H - 2} fontSize="9" textAnchor="end" fill="var(--ink-3)">1 s, ten trials</text>
      </svg>
      <Slider label="internal noise" value={noise} min={0} max={80} step={2} onChange={setNoise} unit="pA·√ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean spikes per trial" value={(trials.reduce((a, s) => a + s.length, 0) / trials.length).toFixed(1)} />
        <Stat label="trial-to-trial Γ" value={g.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">With constant input the first spike is well timed but later spikes drift apart, because each trial's noise shifts every interval a little and the shifts add up. With the frozen fluctuating input, steep rises in the current force spikes at the same moments on every trial, and the rasters line up into columns, unless the internal noise becomes large.</p>
    </div>
  );
}
