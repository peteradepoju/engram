"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** Sampling a sinusoid too slowly makes it masquerade as a lower frequency. */
export function Aliasing() {
  const [f, setF] = useState(9);
  const [fs, setFs] = useState(12);
  const W = 560, H = 220, T = 1, X = (t: number) => 30 + (t / T) * (W - 40), Y = (v: number) => 100 - v * 70;
  const alias = Math.abs(f - fs * Math.round(f / fs));
  const sign = Math.sign(Math.sin(2 * Math.PI * f * (1 / fs))) === Math.sign(Math.sin(2 * Math.PI * alias * (1 / fs))) ? 1 : -1;
  const samples = Array.from({ length: Math.floor(T * fs) + 1 }, (_, i) => i / fs);
  const curve = (g: (t: number) => number) => Array.from({ length: 1001 }, (_, i) => `${X(i / 1000)},${Y(g(i / 1000))}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label="A sampled sinusoid and its alias">
        <line x1="30" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" />
        <polyline points={curve((t) => Math.sin(2 * Math.PI * f * t))} fill="none" stroke="var(--ink-3)" strokeWidth="1.2" />
        {f > fs / 2 ? <polyline points={curve((t) => sign * Math.sin(2 * Math.PI * alias * t))} fill="none" stroke="var(--bad)" strokeWidth="2" strokeDasharray="6 4" /> : null}
        {samples.map((t, i) => <g key={i}><line x1={X(t)} x2={X(t)} y1={Y(0)} y2={Y(Math.sin(2 * Math.PI * f * t))} stroke="var(--accent)" /><circle cx={X(t)} cy={Y(Math.sin(2 * Math.PI * f * t))} r="4" fill="var(--accent)" /></g>)}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={X(t)} y={H - 6} fontSize="9" textAnchor="middle" fill="var(--ink-3)">{t} s</text>)}
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="signal frequency" value={f} min={1} max={40} step={0.5} onChange={setF} unit="Hz" fmt={(v) => v.toFixed(1)} />
        <Slider label="sampling rate" value={fs} min={4} max={100} step={1} onChange={setFs} unit="Hz" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Nyquist frequency fs / 2" value={`${(fs / 2).toFixed(1)} Hz`} />
        <Stat label="apparent frequency" value={`${(f > fs / 2 ? alias : f).toFixed(1)} Hz`} />
        <Stat label="safe?" value={f < fs / 2 ? "yes" : "aliased"} />
      </div>
      <p className="text-sm text-ink-2">Grey: the true signal. Purple: the samples. When the signal is faster than half the sampling rate, the samples are equally well fitted by a slower sinusoid (red dashed), and nothing in the samples can tell them apart. This is aliasing. Recording systems filter out frequencies above the Nyquist frequency before sampling for exactly this reason.</p>
    </div>
  );
}
