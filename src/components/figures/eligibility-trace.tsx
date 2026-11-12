"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** A Hebbian tag decaying with τe, converted to a weight change by a delayed dopamine pulse. */
export function EligibilityTrace() {
  const [delay, setDelay] = useState(1.0);
  const [tau, setTau] = useState(1.0);
  const T = 4, W = 360, H = 170;
  const ts = Array.from({ length: 201 }, (_, i) => (i / 200) * T);
  const tag = (t: number) => (t < 0.2 ? 0 : Math.exp(-(t - 0.2) / tau));
  const tr = 0.2 + delay, dw = tag(tr);
  const sx = (t: number) => 20 + (t / T) * 320, sy = (v: number) => H - 25 - v * (H - 50);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Eligibility trace">
        <line x1="20" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <line x1={sx(0.2)} x2={sx(0.2)} y1={sy(0)} y2={sy(1.05)} stroke="var(--neuro)" strokeWidth="2" />
        <text x={sx(0.2) + 3} y={sy(1.05) + 2} fontSize="8" fill="var(--neuro)">pre and post coincide</text>
        <polyline points={ts.map((t) => `${sx(t)},${sy(tag(t))}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.5" />
        {tr <= T && <line x1={sx(tr)} x2={sx(tr)} y1={sy(0)} y2={sy(0.9)} stroke="var(--ai)" strokeWidth="2" strokeDasharray="4 2" />}
        {tr <= T && <circle cx={sx(tr)} cy={sy(dw)} r="4" fill="var(--ai)" />}
        {tr <= T && <text x={Math.min(sx(tr) + 3, 290)} y={sy(0.8)} fontSize="8" fill="var(--ai)">dopamine</text>}
        <text x="338" y={H - 8} fontSize="8" textAnchor="end" fill="var(--ink-3)">time (s)</text>
        <text x="338" y="16" fontSize="8" textAnchor="end" fill="var(--ink-3)">eligibility trace e(t)</text>
      </svg>
      <Slider label="reward delay" value={delay} min={0} max={3.5} step={0.1} onChange={setDelay} unit="s" />
      <Slider label="trace time constant τe" value={tau} min={0.1} max={3} step={0.1} onChange={setTau} unit="s" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="trace left at reward" value={dw.toFixed(2)} />
        <Stat label="weight change" value={dw > 0.05 ? "potentiation" : "almost none"} />
      </div>
      <p className="text-sm text-ink-2">The weight changes only when dopamine arrives, by an amount set by how much of the tag remains. Spine experiments in striatum found a window of roughly 0.3 to 2 seconds, consistent with a trace of about a second.</p>
    </div>
  );
}
