"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const NEURONS = 400, TRIALS = 20;

/** Selecting neurons by a contrast and then measuring that contrast in the same data inflates it. */
export function DoubleDipping() {
  const [thr, setThr] = useState(1);
  const st = useMemo(() => {
    const r = rng(595);
    const half = (): number => { let s = 0; for (let t = 0; t < TRIALS / 2; t++) s += gauss(r); return s / (TRIALS / 2); };
    const cells = Array.from({ length: NEURONS }, () => {
      const effect = r() < 0.1 ? 0.5 : 0;                       // 10% of neurons truly prefer condition A
      const a1 = effect + half(), b1 = half(), a2 = effect + half(), b2 = half();
      return { effect, d1: a1 - b1, d2: a2 - b2 };
    });
    const sel = cells.filter((c) => c.d1 > thr * Math.sqrt(0.2));   // select on the first half of the trials
    const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    return { n: sel.length, circular: mean(sel.map((c) => c.d1)), independent: mean(sel.map((c) => c.d2)), truth: mean(sel.map((c) => c.effect)) };
  }, [thr]);
  const sy = (v: number): number => 150 - v * 100;
  const bar = (v: number, x: number, c: string, l1: string, l2: string) => (
    <g>
      <rect x={x} y={sy(Math.max(v, 0))} width="70" height={Math.abs(v) * 100} fill={c} opacity="0.8" />
      <text x={x + 35} y={sy(Math.max(v, 0)) - 4} fontSize="9" textAnchor="middle" fill="var(--ink)">{v.toFixed(2)}</text>
      <text x={x + 35} y="160" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{l1}</text>
      <text x={x + 35} y="169" fontSize="8" textAnchor="middle" fill="var(--ink-3)">{l2}</text>
    </g>
  );
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 172" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Circular and independent estimates of a selected effect">
        <line x1="20" x2="320" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {bar(st.circular, 30, "var(--neuro)", "same trials", "(circular)")}
        {bar(st.independent, 135, "var(--ai)", "held-out half", "(independent)")}
        {bar(st.truth, 240, "var(--ink-3)", "true effect of", "selected neurons")}
        <text x="24" y="14" fontSize="8" fill="var(--ink-3)">mean A minus B response of the neurons selected as preferring A</text>
      </svg>
      <Slider label="selection threshold (in standard errors)" value={thr} min={0} max={4} step={0.1} onChange={setThr} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="neurons selected" value={`${st.n} of ${NEURONS}`} />
        <Stat label="inflation of the circular estimate" value={`${(st.circular - st.truth).toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">Of 400 neurons, only 40 truly respond more to condition A, by 0.5. Select the neurons whose A minus B difference passes a threshold, then report the difference in those same trials, and noise that helped them pass is counted as effect: the estimate is inflated, and stricter thresholds inflate it more. Here selection uses half of the trials; measuring the selected neurons on the other half gives an unbiased estimate of their true effect.</p>
    </div>
  );
}
