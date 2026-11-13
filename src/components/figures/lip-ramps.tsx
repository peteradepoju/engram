"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Model LIP activity aligned to motion onset and to the decision. */
export function LIPRamps() {
  const [bound, setBound] = useState(1);
  const [lat, setLat] = useState(0.2);
  const cohs = [0, 0.128, 0.256, 0.512], dt = 0.01, T = 100, k = 8;
  const res = useMemo(() => {
    const r = rng(2001);
    const g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    return cohs.map((c) => {
      const on = new Array(T).fill(0), resp = new Array(40).fill(0), rc = new Array(40).fill(0);
      let rts = 0, nr = 0; const n = 250;
      for (let j = 0; j < n; j++) {
        let x = 0, dec = -1; const tr: number[] = [];
        for (let i = 0; i < T; i++) {
          if (i * dt >= lat && dec < 0) { x += k * c * dt + 0.6 * Math.sqrt(dt) * g(); if (Math.abs(x) >= bound) { x = Math.sign(x) * bound; dec = i; } }
          const rate = Math.max(0, 20 + 30 * x); tr.push(rate); on[i] += rate / n;
        }
        if (dec > 0 && x > 0) { rts += dec * dt; nr++; for (let m = 0; m < 40; m++) { const i = dec - 39 + m; if (i >= 0) { resp[m] += tr[i]; rc[m]++; } } }
      }
      return { on, resp: resp.map((v, m) => (rc[m] ? v / rc[m] : NaN)), rt: nr ? rts / nr : NaN };
    });
  }, [bound, lat]);
  const cols = ["var(--ink-3)", "var(--ai)", "var(--neuro)", "var(--ink)"];
  const sy = (v: number) => 160 - (Math.min(v, 80) / 80) * 140;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 180" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Model LIP activity">
        <line x1="20" x2="200" y1="160" y2="160" stroke="var(--line)" />
        <line x1="230" x2="340" y1="160" y2="160" stroke="var(--line)" />
        <line x1="340" x2="340" y1="15" y2="160" stroke="var(--line)" strokeDasharray="3 3" />
        {res.map((d, ci) => (
          <g key={ci}>
            <polyline points={d.on.map((v, i) => `${20 + i * 1.8},${sy(v)}`).join(" ")} fill="none" stroke={cols[ci]} strokeWidth="1.6" />
            <polyline points={d.resp.map((v, m) => (isFinite(v) ? `${230 + m * 2.8},${sy(v)}` : "")).filter(Boolean).join(" ")} fill="none" stroke={cols[ci]} strokeWidth="1.6" />
          </g>
        ))}
        <text x="22" y="174" fontSize="8" fill="var(--ink-3)">motion onset → 1 s</text>
        <text x="338" y="174" fontSize="8" textAnchor="end" fill="var(--ink-3)">decision</text>
        {cohs.map((c, i) => <text key={c} x={24 + i * 40} y="14" fontSize="8" fill={cols[i]}>{(100 * c).toFixed(1)}%</text>)}
      </svg>
      <Slider label="bound" value={bound} min={0.4} max={1.6} step={0.1} onChange={setBound} fmt={(v) => v.toFixed(1)} />
      <Slider label="latency of build-up" value={lat} min={0.05} max={0.4} step={0.01} onChange={setLat} unit="s" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean decision time, 12.8%" value={`${res[1].rt.toFixed(2)} s`} />
        <Stat label="mean decision time, 51.2%" value={`${res[3].rt.toFixed(2)} s`} />
      </div>
      <p className="text-sm text-ink-2">Left: averages from motion onset fan out with coherence. Right: averages over trials ending at the upper bound, aligned to the decision, converge on the same level whatever the coherence.</p>
    </div>
  );
}
