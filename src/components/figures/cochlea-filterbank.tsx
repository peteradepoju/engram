"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const erb = (f: number) => 24.7 * (4.37 * f / 1000 + 1);
const erbNum = (f: number) => 21.4 * Math.log10(4.37 * f / 1000 + 1);
const fromNum = (e: number) => (10 ** (e / 21.4) - 1) * 1000 / 4.37;

/** Order-4 gammatone magnitude responses on the ERB scale, and the excitation pattern (power summed over harmonics) of a harmonic complex. */
export function CochleaFilterbank() {
  const [f0, setF0] = useState(150);
  const [n, setN] = useState(24);
  const gain = (f: number, fc: number) => { const b = 1.019 * erb(fc); return (1 + ((f - fc) / b) ** 2) ** -4; }; // |H|² of order-4 gammatone, approx.
  const cfs = useMemo(() => Array.from({ length: n }, (_, i) => fromNum(erbNum(100) + (i / (n - 1)) * (erbNum(5000) - erbNum(100)))), [n]);
  const dense = useMemo(() => Array.from({ length: 200 }, (_, i) => fromNum(erbNum(80) + (i / 199) * (erbNum(5000) - erbNum(80)))), []);
  const excite = dense.map((fc) => { let p = 0; for (let h = 1; h * f0 < 8000; h++) p += gain(h * f0, fc); return 10 * Math.log10(p + 1e-9); });
  const emax = Math.max(...excite);
  const W = 360, sx = (f: number) => 15 + ((Math.log10(f) - Math.log10(80)) / (Math.log10(5000) - Math.log10(80))) * 335;
  let resolved = 0;
  for (let h = 1; h * f0 < 5000; h++) {
    const at = (f: number) => { let i = dense.findIndex((d) => d >= f); if (i < 0) i = dense.length - 1; return excite[i]; };
    if (at(h * f0) - at((h + 0.5) * f0) >= 2) resolved = h; else break;
  }
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 220`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Gammatone filter bank and excitation pattern">
        <text x="15" y="12" fontSize="9" fill="var(--ink-3)">filter responses (80 Hz to 5 kHz, log axis)</text>
        {cfs.map((fc, i) => <polyline key={i} points={dense.map((f) => `${sx(f)},${90 - gain(f, fc) * 70}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="0.9" opacity="0.7" />)}
        {Array.from({ length: Math.floor(5000 / f0) }, (_, h) => <line key={h} x1={sx((h + 1) * f0)} x2={sx((h + 1) * f0)} y1="100" y2="212" stroke="var(--line)" />)}
        <text x="15" y="112" fontSize="9" fill="var(--ink-3)">excitation pattern of the harmonic complex (dB)</text>
        <polyline points={excite.map((e, i) => `${sx(dense[i])},${212 - Math.max(0, (e - emax + 30) / 30) * 90}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
      </svg>
      <Slider label="fundamental frequency F0" value={f0} min={80} max={400} step={5} onChange={setF0} unit="Hz" />
      <Slider label="filters shown" value={n} min={8} max={48} step={1} onChange={setN} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="harmonics resolved (2 dB peaks)" value={`1 to ${resolved}`} />
        <Stat label="ERB at 1 kHz" value={`${erb(1000).toFixed(0)} Hz`} />
      </div>
      <p className="text-sm text-ink-2">Grey lines mark the harmonics. Filters are equally spaced and equally wide on this logarithmic-like ERB axis, so they look similar, but in hertz the high ones are far wider. The excitation pattern shows a peak for each low harmonic; as harmonics crowd together relative to the filter widths, the peaks merge. Raise F0 and a few more harmonics are resolved, because at low frequencies the filters are wider than a fixed fraction of their centre frequency, so a low voice loses more of its harmonics to merging.</p>
    </div>
  );
}
