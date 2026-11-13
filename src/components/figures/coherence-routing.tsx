"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Sender spikes arriving on a receiver's oscillating excitability. */
export function CoherenceRouting() {
  const [lead, setLead] = useState(1.0);
  const [jitter, setJitter] = useState(2);
  const [delay, setDelay] = useState(4);
  const f = 40;
  const { arrivals, gain } = useMemo(() => {
    const r = rng(2015), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const arr: number[] = []; let s = 0;
    for (let i = 0; i < 400; i++) {
      const k = Math.floor(r() * 4);
      const t = k / f - lead / (2 * Math.PI * f) + (jitter / 1000) * g() + delay / 1000;
      arr.push(t); s += 0.5 * (1 + Math.cos(2 * Math.PI * f * t));
    }
    return { arrivals: arr, gain: s / 400 };
  }, [lead, jitter, delay]);
  const W = 360, H = 150, T = 0.1, sx = (t: number) => 20 + ((((t % T) + T) % T) / T) * 320;
  const ex = Array.from({ length: 201 }, (_, i) => (i / 200) * T);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Sender spikes on receiver excitability">
        <polyline points={ex.map((t) => `${sx(t)},${110 - 80 * 0.5 * (1 + Math.cos(2 * Math.PI * f * t))}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {arrivals.map((t, i) => <line key={i} x1={sx(t)} x2={sx(t)} y1="118" y2="132" stroke="var(--neuro)" strokeWidth="0.6" opacity="0.5" />)}
        <text x="22" y="20" fontSize="8" fill="var(--ai)">receiver excitability (40 Hz)</text>
        <text x="22" y="145" fontSize="8" fill="var(--neuro)">arrival times of sender spikes</text>
        <text x="340" y="145" fontSize="8" textAnchor="end" fill="var(--ink-3)">100 ms</text>
      </svg>
      <Slider label="sender lead" value={lead} min={0} max={6.28} step={0.05} onChange={setLead} unit=" rad" />
      <Slider label="spike timing jitter" value={jitter} min={0} max={15} step={0.5} onChange={setJitter} unit=" ms" />
      <Slider label="conduction delay" value={delay} min={0} max={15} step={0.5} onChange={setDelay} unit=" ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="effective gain" value={gain.toFixed(2)} />
        <Stat label="lead that compensates the delay" value={`${((2 * Math.PI * f * delay) / 1000 % (2 * Math.PI)).toFixed(2)} rad`} />
      </div>
      <p className="text-sm text-ink-2">When the sender leads by the phase its spikes need to cross the delay, they arrive at the receiver&apos;s peaks and the gain approaches 1. Add jitter and the spikes smear across the cycle, pulling the gain towards the average of 0.5.</p>
    </div>
  );
}
