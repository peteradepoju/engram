"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const A = 0.0875, C = 343;

/** Activity across an array of Jeffress coincidence detectors (internal delays from -700 to +700 µs) for a source at a chosen azimuth: broadband noise or a pure tone. */
export function ITDArray() {
  const [az, setAz] = useState(35);
  const [freq, setFreq] = useState(0);
  const th = (az * Math.PI) / 180, itd = (A / C) * (th + Math.sin(Math.abs(th)) * Math.sign(th)) * 1e6;
  const delays = Array.from({ length: 141 }, (_, i) => -700 + i * 10);
  const act = delays.map((d) => {
    const x = (d - itd) * 1e-6;
    if (freq === 0) return Math.exp(-((x * 15000) ** 2)) * 0.9 + 0.1; // noise: a sharp peak about 60 µs wide
    return 0.5 + 0.5 * Math.cos(2 * Math.PI * freq * x);
  });
  const peaks = delays.filter((_, i) => i > 0 && i < delays.length - 1 && act[i] >= act[i - 1] && act[i] > act[i + 1] && act[i] > 0.95);
  const W = 360, H = 180, sx = (d: number) => 20 + ((d + 700) / 1400) * 320;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Coincidence detector array activity">
        <rect x={sx(-656)} y="15" width={sx(656) - sx(-656)} height={H - 45} fill="var(--accent-soft)" opacity="0.5" />
        {delays.map((d, i) => <rect key={d} x={sx(d) - 1} y={H - 30 - act[i] * (H - 55)} width="2" height={act[i] * (H - 55)} fill="var(--ai)" />)}
        <line x1={sx(itd)} x2={sx(itd)} y1="12" y2={H - 28} stroke="var(--neuro)" strokeDasharray="3 3" />
        <text x={sx(itd) + 3} y="22" fontSize="9" fill="var(--neuro)">true ITD</text>
        <text x="20" y={H - 12} fontSize="9" fill="var(--ink-3)">-700 µs (left leads)</text>
        <text x="340" y={H - 12} fontSize="9" textAnchor="end" fill="var(--ink-3)">+700 µs</text>
        <text x="24" y="28" fontSize="8" fill="var(--ink-3)">shaded: delays a human head can produce</text>
      </svg>
      <Slider label="source azimuth" value={az} min={-90} max={90} step={1} onChange={setAz} unit="°" />
      <Slider label="tone frequency (0 = broadband noise)" value={freq} min={0} max={3000} step={100} onChange={setFreq} unit="Hz" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="true ITD" value={`${itd.toFixed(0)} µs`} />
        <Stat label="equally active detectors" value={`${peaks.length}`} />
      </div>
      <p className="text-sm text-ink-2">Each bar is a coincidence detector with its own internal delay; its activity is the correlation of the two ears&apos; signals at that delay. Noise lights up one detector, at the true ITD. A low tone gives a broad bump with one peak in range. Above about 1.5 kHz, the tone&apos;s period is shorter than the range of delays and two or more detectors are equally active: the direction is ambiguous.</p>
    </div>
  );
}
