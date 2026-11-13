"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";

/** Confidence P(correct | x, T) as a map over accumulated evidence and elapsed time. */
export function ConfidenceMap() {
  const [x, setX] = useState(1);
  const [T, setT] = useState(0.4);
  const cohs = [0, 0.032, 0.064, 0.128, 0.256, 0.512], k = 6;
  const conf = (xv: number, tv: number) => {
    let num = 0, den = 0;
    for (const c of cohs) {
      const mu = k * c * tv, lp = Math.exp(-((xv - mu) ** 2) / (2 * tv)), lm = Math.exp(-((xv + mu) ** 2) / (2 * tv));
      num += xv >= 0 ? lp : lm; den += lp + lm;
    }
    return num / den;
  };
  const grid = useMemo(() => {
    const out: { xv: number; tv: number; c: number }[] = [];
    for (let i = 0; i < 40; i++) for (let j = 0; j < 24; j++) {
      const xv = -2.5 + (5 * (i + 0.5)) / 40, tv = 0.05 + (0.95 * (j + 0.5)) / 24;
      out.push({ xv, tv, c: conf(xv, tv) });
    }
    return out;
  }, []);
  const W = 360, H = 180, sx = (v: number) => 30 + ((v + 2.5) / 5) * 310, sy = (t: number) => H - 20 - ((t - 0.05) / 0.95) * (H - 35);
  const here = conf(x, T);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Confidence map">
        {grid.map((p, i) => (
          <rect key={i} x={sx(p.xv) - 3.9} y={sy(p.tv) - 3.4} width="7.9" height="6.9" fill="var(--ai)" opacity={(p.c - 0.5) * 2} />
        ))}
        <circle cx={sx(x)} cy={sy(T)} r="4.5" fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <line x1={sx(0)} x2={sx(0)} y1="12" y2={H - 20} stroke="var(--line)" />
        <text x="338" y={H - 6} fontSize="8" textAnchor="end" fill="var(--ink-3)">accumulated evidence x (favouring right →)</text>
        <text x="34" y="14" fontSize="8" fill="var(--ink-3)">elapsed time ↑</text>
      </svg>
      <Slider label="accumulated evidence x" value={x} min={-2.5} max={2.5} step={0.05} onChange={setX} fmt={(v) => v.toFixed(2)} />
      <Slider label="elapsed time T" value={T} min={0.05} max={1} step={0.05} onChange={setT} unit="s" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="choice" value={x >= 0 ? "right" : "left"} />
        <Stat label="confidence" value={here.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Brighter means more confident. Moving up at fixed evidence, confidence falls, because a long time to reach the same total implies a weak stimulus. Difficulty is drawn from six coherences, as in the lesson.</p>
    </div>
  );
}
