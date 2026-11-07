"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A damped oscillator x'' + 2ζω₀x' + ω₀²x = drive: its impulse response and its resonance curve. */
export function DampedOscillator() {
  const [zeta, setZeta] = useState(0.15);
  const [f0, setF0] = useState(8);
  const [fd, setFd] = useState(8);
  const w0 = 2 * Math.PI * f0;
  const amp = (f: number) => { const w = 2 * Math.PI * f; return 1 / Math.sqrt((w0 * w0 - w * w) ** 2 + (2 * zeta * w0 * w) ** 2); };
  const W = 360, H1 = 120, H2 = 120, T = 0.5;
  const imp = (t: number) => { if (zeta < 1) { const wd = w0 * Math.sqrt(1 - zeta * zeta); return Math.exp(-zeta * w0 * t) * Math.sin(wd * t) / wd; } const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1)), r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1)); return (Math.exp(r1 * t) - Math.exp(r2 * t)) / (r1 - r2); };
  const ts = Array.from({ length: 301 }, (_, i) => (i / 300) * T), iv = ts.map(imp), imax = Math.max(...iv.map(Math.abs)) || 1;
  const fs = Array.from({ length: 201 }, (_, i) => 0.5 + (i / 200) * 29.5), av = fs.map(amp), amax = Math.max(...av);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H1 + H2 + 30}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Impulse response and resonance curve of a damped oscillator">
        <line x1="20" x2={W - 10} y1={H1 / 2 + 8} y2={H1 / 2 + 8} stroke="var(--line)" />
        <polyline points={ts.map((t, i) => `${20 + (t / T) * (W - 30)},${H1 / 2 + 8 - (iv[i] / imax) * (H1 / 2 - 14)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="22" y="16" fontSize="10" fill="var(--ai)">impulse response (0 to 500 ms)</text>
        <g transform={`translate(0 ${H1 + 6})`}>
          <line x1="20" x2={W - 10} y1={H2 - 6} y2={H2 - 6} stroke="var(--line)" />
          <polyline points={fs.map((f, i) => `${20 + ((f - 0.5) / 29.5) * (W - 30)},${H2 - 6 - (av[i] / amax) * (H2 - 24)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
          <circle cx={20 + ((fd - 0.5) / 29.5) * (W - 30)} cy={H2 - 6 - (amp(fd) / amax) * (H2 - 24)} r="5" fill="var(--neuro)" />
          {[0, 10, 20, 30].map((f) => <text key={f} x={20 + ((f - 0.5) / 29.5) * (W - 30)} y={H2 + 8} fontSize="10" textAnchor={f === 30 ? "end" : "middle"} fill="var(--ink-3)">{f} Hz</text>)}
          <text x="22" y="10" fontSize="10" fill="var(--neuro)">response amplitude to sinusoidal drive</text>
        </g>
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="natural frequency" value={f0} min={2} max={25} step={0.5} onChange={setF0} unit="Hz" />
        <Slider label="damping ratio ζ" value={zeta} min={0.02} max={2} step={0.01} onChange={setZeta} fmt={(v) => v.toFixed(2)} />
        <Slider label="drive frequency" value={fd} min={0.5} max={30} step={0.5} onChange={setFd} unit="Hz" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="behaviour" value={zeta < 1 ? "rings (underdamped)" : zeta === 1 ? "critical" : "no ringing"} />
        <Stat label="gain at drive / at 0.5 Hz" value={(amp(fd) / amp(0.5)).toFixed(2)} />
        <Stat label="quality factor 1/(2ζ)" value={(1 / (2 * zeta)).toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">Some neurons have a second, slower current that pushes back against changes in voltage, which makes the membrane behave like a damped spring. Its impulse response rings at about the natural frequency, and driven by a sinusoid it responds most strongly near that frequency: resonance. Light damping gives a sharp, tall peak; heavy damping removes the ringing and the peak.</p>
    </div>
  );
}
