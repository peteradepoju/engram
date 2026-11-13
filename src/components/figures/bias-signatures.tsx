"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Proportion of 'right' choices across response-time bins for starting-point and drift bias. */
export function BiasSignatures() {
  const [kind, setKind] = useState<"start" | "drift">("start");
  const [size, setSize] = useState(0.5);
  const res = useMemo(() => {
    const r = rng(2011), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const n = 2500, dt = 0.004, sq = Math.sqrt(dt), out: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const s = r() < 0.5 ? 1 : -1, v = 0.8 * s + (kind === "drift" ? size * 0.8 : 0);
      let x = kind === "start" ? size * 0.6 : 0, t = 0;
      while (Math.abs(x) < 1 && t < 4) { x += v * dt + sq * g(); t += dt; }
      out.push([t, x > 0 ? 1 : 0]);
    }
    out.sort((p, q) => p[0] - q[0]);
    const bins = 5, per = Math.floor(n / bins);
    return Array.from({ length: bins }, (_, b) => out.slice(b * per, (b + 1) * per).reduce((acc, p) => acc + p[1], 0) / per);
  }, [kind, size]);
  const W = 360, H = 170, sy = (v: number) => H - 25 - v * (H - 45);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["start", "drift"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`rounded-md border px-3 py-1 text-xs ${kind === k ? "border-accent text-accent" : "border-line text-ink-2"}`}>{k === "start" ? "starting-point bias" : "drift bias"}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Choice proportion by response time bin">
        <line x1="40" x2="340" y1={sy(0.5)} y2={sy(0.5)} stroke="var(--ink-3)" strokeDasharray="3 3" />
        <line x1="40" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <text x="36" y={sy(0.5) + 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">0.5</text>
        <text x="36" y={sy(1) + 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">1</text>
        {res.map((p, b) => (
          <g key={b}>
            <rect x={55 + b * 58} y={sy(p)} width="40" height={sy(0) - sy(p)} fill={kind === "start" ? "var(--neuro)" : "var(--ai)"} opacity="0.8" />
            <text x={75 + b * 58} y={H - 10} fontSize="8" textAnchor="middle" fill="var(--ink-3)">{["fastest", "", "middle", "", "slowest"][b]}</text>
          </g>
        ))}
        <text x="44" y="14" fontSize="8" fill="var(--ink-3)">proportion of choices for the favoured option</text>
      </svg>
      <Slider label="size of bias" value={size} min={0} max={1} step={0.05} onChange={setSize} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="fastest fifth" value={res[0].toFixed(2)} />
        <Stat label="slowest fifth" value={res[4].toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">Responses are sorted by response time into five equal bins. A starting-point bias is concentrated in the fastest responses; a drift bias spreads across all of them.</p>
    </div>
  );
}
