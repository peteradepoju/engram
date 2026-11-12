"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

/** Spikes, raw fluorescence with neuropil contamination, and neuropil-corrected ΔF/F over 30 s at 30 Hz. */
export function CalciumTrace() {
  const [tau, setTau] = useState(0.7);
  const [neu, setNeu] = useState(0.7);
  const { spk, raw, cor, corrR, corrC } = useMemo(() => {
    const r = rng(2020), fs = 30, T = 900, g = Math.exp(-1 / (fs * tau));
    let c = 0; const spk: number[] = [], cal: number[] = [], raw: number[] = [], np: number[] = [];
    for (let i = 0; i < T; i++) {
      const n = poisson(1.2 / fs, r); spk.push(n); c = g * c + n; cal.push(c);
      const t = i / fs, ne = 0.6 + 0.5 * Math.sin(2 * Math.PI * t / 11) + 0.35 * Math.sin(2 * Math.PI * t / 3.1);
      np.push(100 * ne + 2 * (r() - 0.5)); raw.push(100 * (1 + 0.5 * c) + neu * 100 * ne + 4 * (r() - 0.5));
    }
    const base = (x: number[]) => [...x].sort((a, b) => a - b)[Math.floor(x.length * 0.1)];
    const corrected = raw.map((v, i) => v - 0.7 * np[i]);
    const b1 = base(raw), b2 = base(corrected);
    const dr = raw.map((v) => (v - b1) / b1), dc = corrected.map((v) => (v - b2) / b2);
    const corr = (a: number[], b: number[]) => { const ma = a.reduce((s, v) => s + v, 0) / a.length, mb = b.reduce((s, v) => s + v, 0) / b.length; let sab = 0, saa = 0, sbb = 0; a.forEach((v, i) => { sab += (v - ma) * (b[i] - mb); saa += (v - ma) ** 2; sbb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(saa * sbb); };
    return { spk, raw: dr, cor: dc, corrR: corr(dr, cal), corrC: corr(dc, cal) };
  }, [tau, neu]);
  const W = 360, sx = (i: number) => 10 + (i / 899) * 340;
  const line = (x: number[], y0: number, h: number) => { const lo = Math.min(...x), hi = Math.max(...x); return x.map((v, i) => `${sx(i)},${y0 - ((v - lo) / (hi - lo || 1)) * h}`).join(" "); };
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 230`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Spikes, raw fluorescence and corrected ΔF/F">
        <text x="10" y="12" fontSize="9" fill="var(--ink-3)">spikes</text>
        {spk.map((n, i) => n > 0 ? <line key={i} x1={sx(i)} x2={sx(i)} y1="18" y2={18 + 8 * n} stroke="var(--ink)" strokeWidth="1" /> : null)}
        <text x="10" y="52" fontSize="9" fill="var(--neuro)">raw ΔF/F (neuropil left in)</text>
        <polyline points={line(raw, 128, 70)} fill="none" stroke="var(--neuro)" strokeWidth="1" />
        <text x="10" y="148" fontSize="9" fill="var(--ai)">corrected ΔF/F</text>
        <polyline points={line(cor, 224, 70)} fill="none" stroke="var(--ai)" strokeWidth="1.2" />
      </svg>
      <Slider label="indicator decay time" value={tau} min={0.1} max={2} step={0.05} onChange={setTau} unit="s" fmt={(v) => v.toFixed(2)} />
      <Slider label="neuropil contamination" value={neu} min={0} max={1.5} step={0.05} onChange={setNeu} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="raw: correlation with calcium" value={corrR.toFixed(2)} />
        <Stat label="corrected" value={corrC.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Thirty seconds at 30 Hz. A fast indicator gives a sharp transient for each spike; a slow one merges bursts into long humps. The neuropil adds slow waves that are not the cell&apos;s own activity. Subtracting 0.7 times the surround removes them when the true contamination is near 0.7, and over- or under-corrects when it is not, which is why pipelines estimate the factor cell by cell.</p>
    </div>
  );
}
