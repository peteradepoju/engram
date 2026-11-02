"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** The membrane as a low-pass filter: gain and phase lag of a sinusoidal input at each frequency. */
export function FilterResponse() {
  const [tau, setTau] = useState(20);
  const [f, setF] = useState(10);
  const w = 2 * Math.PI * f * tau / 1000;
  const gain = 1 / Math.sqrt(1 + w * w), lag = Math.atan(w);
  const W = 560, X = (t: number) => 30 + t * (W - 40) / 0.3;
  const sig = (t: number, a: number, p: number) => 60 - a * 38 * Math.sin(2 * Math.PI * f * t - p);
  const bx = (fr: number) => 40 + (Math.log10(fr) / 3) * (W - 60), by = (g: number) => 120 + (-20 * Math.log10(g)) * 2.2;
  const curve = Array.from({ length: 200 }, (_, i) => { const fr = Math.pow(10, (i / 199) * 3); const ww = 2 * Math.PI * fr * tau / 1000; return `${bx(fr)},${by(1 / Math.sqrt(1 + ww * ww))}`; }).join(" ");
  const fc = 1000 / (2 * Math.PI * tau);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 250`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="Input and output sinusoids and the filter's gain curve">
        <polyline points={Array.from({ length: 601 }, (_, i) => `${X((i / 600) * 0.3)},${sig((i / 600) * 0.3, 1, 0)}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="1.2" />
        <polyline points={Array.from({ length: 601 }, (_, i) => `${X((i / 600) * 0.3)},${sig((i / 600) * 0.3, gain, lag)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
        <text x="34" y="14" fontSize="10" fill="var(--ink-3)">input current (grey) and membrane voltage (purple), 300 ms</text>
        {[1, 10, 100, 1000].map((fr) => <g key={fr}><line x1={bx(fr)} x2={bx(fr)} y1="118" y2="236" stroke="var(--line)" /><text x={bx(fr)} y="247" fontSize="9" textAnchor="middle" fill="var(--ink-3)">{fr} Hz</text></g>)}
        <polyline points={curve} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <circle cx={bx(f)} cy={by(gain)} r="5" fill="var(--neuro)" />
        <line x1={bx(fc)} x2={bx(fc)} y1="118" y2="236" stroke="var(--warn)" strokeDasharray="3 3" />
        <text x={bx(fc) + 4} y="230" fontSize="9" fill="var(--warn)">cut-off 1/(2πτ)</text>
        <text x={W - 10} y="132" fontSize="9" textAnchor="end" fill="var(--ink-3)">gain (log scale) against frequency</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="membrane time constant τ" value={tau} min={2} max={100} step={1} onChange={setTau} unit="ms" />
        <Slider label="input frequency" value={f} min={1} max={200} step={1} onChange={setF} unit="Hz" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="gain |H(f)|" value={gain.toFixed(3)} />
        <Stat label="phase lag" value={`${((lag * 180) / Math.PI).toFixed(0)}°`} />
        <Stat label="cut-off frequency" value={`${fc.toFixed(1)} Hz`} />
      </div>
      <p className="text-sm text-ink-2">A sinusoidal current into a leaky membrane produces a sinusoidal voltage at the same frequency, scaled by the gain 1/√(1 + (2πfτ)²) and delayed by the phase lag arctan(2πfτ). Below the cut-off frequency the membrane passes the input almost unchanged; above it, the gain falls by half for every doubling of frequency. This is Week 10's exponential kernel seen in the frequency domain.</p>
    </div>
  );
}
