"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Stat } from "./util";

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

/** Gaussian stimuli projected onto two filters; stimuli that evoked spikes are drawn in colour, for a simple cell (one rectified filter) or a complex cell (sum of squares). */
export function STCSubspace() {
  const [complex, setComplex] = useState(true);
  const { all, trig, sta, vars } = useMemo(() => {
    const r = rng(1985), all: [number, number][] = [], trig: [number, number][] = [];
    let sx = 0, sy = 0, n = 0, v1 = 0, v2 = 0;
    for (let i = 0; i < 5000; i++) {
      const p: [number, number] = [gauss(r), gauss(r)];
      const lam = complex ? 0.25 * (p[0] ** 2 + p[1] ** 2) : 0.25 * Math.max(0, p[0]) ** 2 * 2;
      const c = poisson(lam, r);
      if (i < 700) all.push(p);
      for (let j = 0; j < c; j++) { if (trig.length < 700) trig.push(p); sx += p[0]; sy += p[1]; n++; }
    }
    const sta: [number, number] = [sx / n, sy / n];
    for (const p of trig) { v1 += (p[0] - sta[0]) ** 2; v2 += (p[1] - sta[1]) ** 2; }
    return { all, trig, sta, vars: [v1 / trig.length, v2 / trig.length] };
  }, [complex]);
  const W = 360, H = 260, cx = 180, cy = 130, s = 34;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className={`btn !py-1.5 ${!complex ? "btn-primary" : ""}`} onClick={() => setComplex(false)}>simple cell</button>
        <button className={`btn !py-1.5 ${complex ? "btn-primary" : ""}`} onClick={() => setComplex(true)}>complex cell</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Stimulus projections onto two filters, with spike-triggered stimuli highlighted">
        <line x1={cx - 120} x2={cx + 120} y1={cy} y2={cy} stroke="var(--line)" />
        <line x1={cx} x2={cx} y1={cy - 120} y2={cy + 120} stroke="var(--line)" />
        {all.map((p, i) => <circle key={`a${i}`} cx={cx + p[0] * s} cy={cy - p[1] * s} r="1.4" fill="var(--ink-3)" opacity="0.35" />)}
        {trig.map((p, i) => <circle key={`t${i}`} cx={cx + p[0] * s} cy={cy - p[1] * s} r="1.8" fill="var(--neuro)" opacity="0.6" />)}
        <line x1={cx} y1={cy} x2={cx + sta[0] * s} y2={cy - sta[1] * s} stroke="var(--ai)" strokeWidth="3" />
        <circle cx={cx + sta[0] * s} cy={cy - sta[1] * s} r="4" fill="var(--ai)" />
        <text x={W - 6} y={cy - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">projection on filter 1</text>
        <text x={cx + 4} y="14" fontSize="9" fill="var(--ink-3)">filter 2</text>
        <text x="8" y={H - 8} fontSize="9" fill="var(--ai)">blue: STA</text>
      </svg>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="STA length" value={Math.hypot(...sta).toFixed(2)} />
        <Stat label="spike-triggered variance, axis 1" value={vars[0].toFixed(2)} />
        <Stat label="axis 2" value={vars[1].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Grey: all stimuli, a round Gaussian cloud with variance 1 on each axis. For a simple cell, spikes follow stimuli on one side of filter 1, so the spike-triggered cloud shifts and the STA points along it. For a complex cell, spikes follow stimuli far from the centre in any direction: the cloud becomes a ring, the STA collapses to nothing, and the information appears as increased variance along both axes.</p>
    </div>
  );
}
