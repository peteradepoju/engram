"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Expectiles of a two-mode reward distribution, as learned by a population of asymmetric learners. */
export function DistributionalTD() {
  const [pLow, setPLow] = useState(0.3);
  const [gap, setGap] = useState(5);
  const { xs, ex, mean } = useMemo(() => {
    const r = rng(2020), n = 6000;
    const g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const xs = Array.from({ length: n }, () => (r() < pLow ? 1 + 0.3 * g() : 1 + gap + 0.8 * g()));
    const taus = Array.from({ length: 19 }, (_, i) => 0.05 + 0.05 * i);
    const ex = taus.map((tau) => {
      let lo = Math.min(...xs), hi = Math.max(...xs);
      for (let k = 0; k < 40; k++) {
        const m = (lo + hi) / 2; let up = 0, dn = 0;
        for (const x of xs) { if (x > m) up += x - m; else dn += m - x; }
        if (tau * up - (1 - tau) * dn > 0) lo = m; else hi = m;
      }
      return (lo + hi) / 2;
    });
    return { xs, ex, mean: xs.reduce((a, b) => a + b, 0) / n };
  }, [pLow, gap]);
  const W = 360, H = 180, xmax = 9, sx = (v: number) => 20 + (Math.max(-1, Math.min(xmax, v)) + 1) / (xmax + 1) * 320;
  const bins = new Array(50).fill(0);
  xs.forEach((x) => { const b = Math.floor(((x + 1) / (xmax + 1)) * 50); if (b >= 0 && b < 50) bins[b]++; });
  const bmax = Math.max(...bins);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Expectiles of a reward distribution">
        {bins.map((b, i) => <rect key={i} x={20 + i * 6.4} y={95 - (b / bmax) * 80} width="6" height={(b / bmax) * 80} fill="var(--ai)" opacity="0.35" />)}
        <line x1="20" x2="340" y1="95" y2="95" stroke="var(--line)" />
        {ex.map((e, i) => (
          <g key={i}>
            <circle cx={sx(e)} cy={110 + i * 3.4} r="2.6" fill="var(--neuro)" />
          </g>
        ))}
        <line x1={sx(mean)} x2={sx(mean)} y1="12" y2="175" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={sx(mean) + 3} y="20" fontSize="8" fill="var(--ink-3)">mean</text>
        <text x="22" y="120" fontSize="8" fill="var(--ink-3)">pessimists (τ small)</text>
        <text x="338" y="174" fontSize="8" textAnchor="end" fill="var(--ink-3)">optimists (τ large)</text>
      </svg>
      <Slider label="probability of the small reward" value={pLow} min={0} max={1} step={0.05} onChange={setPLow} fmt={(v) => v.toFixed(2)} />
      <Slider label="gap between small and large reward" value={gap} min={0} max={7} step={0.5} onChange={setGap} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="most pessimistic learner" value={ex[0].toFixed(2)} />
        <Stat label="most optimistic learner" value={ex[18].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The histogram is the reward distribution; each dot below is one learner&apos;s value, from τ = 0.05 at the top to τ = 0.95 at the bottom. Set the gap to zero and the learners crowd together; widen it and they spread to cover both modes.</p>
    </div>
  );
}
