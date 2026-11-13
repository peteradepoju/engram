"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Evoked response, background noise and their ratio as functions of arousal. */
export function ArousalInvertedU() {
  const [shrink, setShrink] = useState(0.7);
  const [quiet, setQuiet] = useState(0.15);
  const { a, A, s, d, best } = useMemo(() => {
    const a = Array.from({ length: 101 }, (_, i) => i / 100);
    const A = a.map((x) => 1 / (1 + Math.exp((x - shrink) / 0.08)));
    const s = a.map((x) => 0.3 + 1.2 * Math.exp(-x / quiet));
    const d = A.map((v, i) => v / s[i]);
    const m = Math.max(...d);
    return { a, A, s, d: d.map((v) => v / m), best: a[d.indexOf(m)] };
  }, [shrink, quiet]);
  const W = 360, H = 170, sx = (x: number) => 30 + x * 310, sy = (v: number) => H - 22 - Math.min(v, 1.5) / 1.5 * (H - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Inverted U of performance against arousal">
        <line x1="30" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <polyline points={a.map((x, i) => `${sx(x)},${sy(A[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.8" />
        <polyline points={a.map((x, i) => `${sx(x)},${sy(s[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.8" />
        <polyline points={a.map((x, i) => `${sx(x)},${sy(d[i])}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
        <line x1={sx(best)} x2={sx(best)} y1="12" y2={H - 22} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x="34" y="16" fontSize="8" fill="var(--neuro)">evoked response</text>
        <text x="110" y="16" fontSize="8" fill="var(--ai)">background noise</text>
        <text x="190" y="16" fontSize="8" fill="var(--ink)">d&apos; (scaled)</text>
        <text x="340" y={H - 6} fontSize="8" textAnchor="end" fill="var(--ink-3)">arousal (pupil) →</text>
      </svg>
      <Slider label="arousal at which responses shrink" value={shrink} min={0.3} max={1} step={0.01} onChange={setShrink} fmt={(v) => v.toFixed(2)} />
      <Slider label="how fast background noise falls" value={quiet} min={0.05} max={0.5} step={0.01} onChange={setQuiet} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="best arousal" value={best.toFixed(2)} />
        <Stat label="performance at the extremes" value={`${d[0].toFixed(2)} and ${d[100].toFixed(2)} of peak`} />
      </div>
      <p className="text-sm text-ink-2">The peak sits where noise has fallen but responses have not yet shrunk. Make the noise fall faster, or the responses shrink later, and the peak moves and broadens.</p>
    </div>
  );
}
