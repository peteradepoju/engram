"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

const digamma = (x: number) => { let r = 0; while (x < 6) { r -= 1 / x; x += 1; } const f = 1 / (x * x); return r + Math.log(x) - 0.5 / x - f * (1 / 12 - f * (1 / 120 - f / 252)); };

/** Fixed-effects against random-effects Bayesian model selection for a group with a strong minority. */
export function GroupBMS() {
  const [nB, setNB] = useState(6);
  const [strength, setStrength] = useState(15);
  const N = 20;
  const res = useMemo(() => {
    const lbf = Array.from({ length: N }, (_, i) => (i < N - nB ? 3 + 0.4 * Math.sin(i * 1.7) : -(strength + 1.5 * Math.sin(i * 2.3))));
    const lme = lbf.map((d) => (d > 0 ? [d, 0] : [0, -d]));
    const ffx = lbf.reduce((s, v) => s + v, 0);
    let a = [1, 1];
    for (let it = 0; it < 100; it++) {
      const g = lme.map((l) => { const lu = [l[0] + digamma(a[0]) - digamma(a[0] + a[1]), l[1] + digamma(a[1]) - digamma(a[0] + a[1])]; const m = Math.max(...lu); const u = lu.map((v) => Math.exp(v - m)); const s = u[0] + u[1]; return [u[0] / s, u[1] / s]; });
      a = [1 + g.reduce((s, v) => s + v[0], 0), 1 + g.reduce((s, v) => s + v[1], 0)];
    }
    return { lbf, ffx, freqA: a[0] / (a[0] + a[1]) };
  }, [nB, strength]);
  const sy = (v: number) => 90 - Math.max(-80, Math.min(80, v * 3));
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Log Bayes factors by participant">
        <line x1="20" x2="340" y1="90" y2="90" stroke="var(--line)" />
        {res.lbf.map((v, i) => <rect key={i} x={24 + i * 15.8} y={Math.min(sy(v), 90)} width="12" height={Math.abs(sy(v) - 90)} fill={v > 0 ? "var(--ai)" : "var(--neuro)"} />)}
        <text x="24" y="14" fontSize="8" fill="var(--ai)">favours A</text>
        <text x="24" y="176" fontSize="8" fill="var(--neuro)">favours B</text>
        <text x="340" y="14" fontSize="8" textAnchor="end" fill="var(--ink-3)">log Bayes factor per participant</text>
      </svg>
      <Slider label="participants favouring B" value={nB} min={0} max={20} step={1} onChange={setNB} />
      <Slider label="strength of their evidence" value={strength} min={1} max={30} step={0.5} onChange={setStrength} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fixed effects verdict" value={res.ffx > 0 ? `A by ${res.ffx.toFixed(0)}` : `B by ${(-res.ffx).toFixed(0)}`} />
        <Stat label="random effects: frequency of A" value={res.freqA.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Increase the minority&apos;s evidence and the fixed-effects verdict flips to B, while the random-effects estimate of how many people use A barely moves.</p>
    </div>
  );
}
