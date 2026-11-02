"use client";

import { useState } from "react";
import { Slider } from "./util";

const BANDS = [
  { name: "theta", f: 6, colour: "var(--warn)" }, { name: "alpha", f: 10, colour: "var(--neuro)" },
  { name: "beta", f: 20, colour: "var(--ai)" }, { name: "gamma", f: 40, colour: "var(--good)" },
];

/** A signal built from sinusoids at the frequencies of classical brain rhythms. */
export function SineSum() {
  const [amp, setAmp] = useState([0.6, 1.0, 0.3, 0.15]);
  const [phase, setPhase] = useState(0);
  const W = 560, H = 230, n = 500, X = (t: number) => 30 + t * (W - 40), Y = (v: number, base: number, s: number) => base - v * s;
  const comp = (b: number, t: number) => amp[b] * Math.sin(2 * Math.PI * BANDS[b].f * t + (b === 1 ? (phase * Math.PI) / 180 : 0));
  const total = (t: number) => BANDS.reduce((a, _, b) => a + comp(b, t), 0);
  const line = (fn: (t: number) => number, base: number, s: number, x: (t: number) => number = X) => Array.from({ length: n + 1 }, (_, i) => `${x(i / n)},${Y(fn(i / n), base, s)}`).join(" ");
  const Xc = (t: number) => 30 + t * (W - 130);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="A sum of sinusoids">
        {BANDS.map((b, i) => <polyline key={b.name} points={line((t) => comp(i, t), 30 + i * 22, 10, Xc)} fill="none" stroke={b.colour} strokeWidth="1.2" opacity="0.8" />)}
        {BANDS.map((b, i) => <text key={`l${b.name}`} x={W - 6} y={34 + i * 22} fontSize="9" textAnchor="end" fill={b.colour}>{b.name} {b.f} Hz</text>)}
        <polyline points={line(total, 170, 26)} fill="none" stroke="var(--accent)" strokeWidth="2" />
        <text x="34" y="118" fontSize="10" fill="var(--ink-3)">sum (what an electrode records)</text>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={X(t)} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{t} s</text>)}
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        {BANDS.map((b, i) => <Slider key={b.name} label={`${b.name} amplitude`} value={amp[i]} min={0} max={1.5} step={0.05} onChange={(v) => setAmp(amp.map((a, k) => (k === i ? v : a)))} fmt={(v) => v.toFixed(2)} />)}
        <Slider label="alpha phase" value={phase} min={0} max={360} step={5} onChange={setPhase} unit="°" />
      </div>
      <p className="text-sm text-ink-2">Four sinusoids at the frequencies of classical rhythms (thin lines) add up to the signal an electrode would record (thick line). Each is fixed by three numbers: frequency, amplitude and phase. The Fourier transform runs this in reverse, recovering the amplitudes and phases from the sum.</p>
    </div>
  );
}
