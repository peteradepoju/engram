"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The f-I curve of a leaky integrate-and-fire neuron: analytic without noise, simulated with noise. */
export function FICurve() {
  const [tau, setTau] = useState(20);
  const [ref, setRef] = useState(2);
  const [noise, setNoise] = useState(3);
  const vTh = 15, R = 1;                         // threshold 15 mV above rest; I in mV units (R I)
  const rate = (I: number) => (I * R <= vTh ? 0 : 1000 / (ref + tau * Math.log((I * R) / (I * R - vTh))));
  const Is = Array.from({ length: 81 }, (_, i) => (i / 80) * 40);
  const sim = useMemo(() => {
    const r = rng(2005), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    return Is.filter((_, i) => i % 4 === 0).map((I) => {
      let v = 0, n = 0, refr = 0; const dt = 0.1, T = 2000;
      for (let t = 0; t < T; t += dt) {
        if (refr > 0) { refr -= dt; continue; }
        v += (dt / tau) * (-v + I) + noise * Math.sqrt(2 * dt / tau) * g();
        if (v >= vTh) { n++; v = 0; refr = ref; }
      }
      return [I, (n / T) * 1000];
    });
  }, [tau, ref, noise]); // eslint-disable-line react-hooks/exhaustive-deps
  const top = Math.max(60, ...Is.map(rate), ...sim.map((s) => s[1])) * 1.1;
  const W = 360, H = 200, X = (I: number) => 30 + (I / 40) * (W - 40), Y = (f: number) => H - 26 - (f / top) * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Firing rate against input current">
        <line x1="30" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        <line x1={X(vTh)} x2={X(vTh)} y1="12" y2={H - 26} stroke="var(--warn)" strokeDasharray="3 3" />
        <polyline points={Is.map((I) => `${X(I)},${Y(rate(I))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2.5" />
        {sim.map(([I, f], i) => <circle key={i} cx={X(I)} cy={Y(f)} r="3.5" fill="var(--neuro)" />)}
        {[0, 10, 20, 30, 40].map((I) => <text key={I} x={X(I)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{I}</text>)}
        <text x={X(vTh) + 4} y="22" fontSize="10" fill="var(--warn)">rheobase</text>
        <text x="30" y={H + 8} fontSize="10" fill="var(--ai)">line: no noise (formula)</text>
        <text x="170" y={H + 8} fontSize="10" fill="var(--neuro)">dots: simulated with noise</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="membrane τ" value={tau} min={5} max={50} step={1} onChange={setTau} unit="ms" />
        <Slider label="refractory period" value={ref} min={0} max={10} step={0.5} onChange={setRef} unit="ms" />
        <Slider label="input noise" value={noise} min={0} max={8} step={0.25} onChange={setNoise} unit="mV" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="rate at RI = 20 mV" value={`${rate(20).toFixed(1)} Hz`} />
        <Stat label="rate at RI = 40 mV" value={`${rate(40).toFixed(1)} Hz`} />
        <Stat label="ceiling 1/refractory" value={ref > 0 ? `${(1000 / ref).toFixed(0)} Hz` : "none"} />
      </div>
      <p className="text-sm text-ink-2">Without noise, a leaky integrate-and-fire neuron is silent until its input can drive it past threshold (the rheobase), then its rate rises steeply and saturates near one over the refractory period. The curve follows from solving the membrane equation for the time to reach threshold. With noise the neuron fires occasionally even below rheobase, and the sharp corner smooths into a gradual curve, closer to what real neurons show.</p>
    </div>
  );
}
