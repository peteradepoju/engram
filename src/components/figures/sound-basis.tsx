"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const L = 64, FS = 16000;

/** Illustrative basis functions of the two kinds ICA learns from sound: a long Fourier-like waveform and a short damped wavelet, at a chosen centre frequency; with their temporal spread and bandwidth. */
export function SoundBasis() {
  const [f, setF] = useState(2000);
  const [tau, setTau] = useState(0.4);
  const t = Array.from({ length: L }, (_, i) => i / FS);
  const fourier = t.map((x) => Math.sin(2 * Math.PI * f * x) * Math.sin((Math.PI * x * FS) / L));
  const wave = t.map((x, i) => { const tt = (i - 16) / FS; return tt >= 0 ? Math.exp(-tt / (tau / 1000)) * Math.sin(2 * Math.PI * f * tt) : 0; });
  const spread = (a: number[]) => { const p = a.map((v) => v * v), s = p.reduce((x, y) => x + y, 0), m = p.reduce((x, v, i) => x + v * i, 0) / s; return Math.sqrt(p.reduce((x, v, i) => x + v * (i - m) ** 2, 0) / s); };
  const draw = (a: number[], y0: number) => { const mx = Math.max(...a.map(Math.abs), 1e-9); return a.map((v, i) => `${15 + (i / (L - 1)) * 330},${y0 - (v / mx) * 30}`).join(" "); };
  const bwWave = 1 / (Math.PI * tau / 1000);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 170" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Fourier-like and wavelet-like basis functions">
        <text x="15" y="14" fontSize="9" fill="var(--ai)">Fourier-like (from steady tones)</text>
        <polyline points={draw(fourier, 50)} fill="none" stroke="var(--ai)" strokeWidth="1.5" />
        <text x="15" y="96" fontSize="9" fill="var(--neuro)">wavelet-like (from transients)</text>
        <polyline points={draw(wave, 132)} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
        <text x="15" y="165" fontSize="8" fill="var(--ink-3)">0</text><text x="345" y="165" fontSize="8" textAnchor="end" fill="var(--ink-3)">4 ms</text>
      </svg>
      <Slider label="centre frequency" value={f} min={300} max={6000} step={100} onChange={setF} unit="Hz" />
      <Slider label="wavelet decay time" value={tau} min={0.1} max={2} step={0.05} onChange={setTau} unit="ms" fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="spread, Fourier-like" value={`${spread(fourier).toFixed(1)} samples`} />
        <Stat label="spread, wavelet" value={`${spread(wave).toFixed(1)} samples`} />
        <Stat label="wavelet bandwidth" value={`about ${Math.round(bwWave)} Hz`} />
      </div>
      <p className="text-sm text-ink-2">These are idealised versions of what ICA learns. A waveform that lasts the whole window has a sharp frequency, which suits sounds made of steady tones; a brief one pins down when something happened but blurs its frequency, which suits clicks and snaps. Lengthen the wavelet&apos;s decay and its bandwidth narrows: the same trade-off that makes cochlear filters at high frequencies both broad and brief.</p>
    </div>
  );
}
