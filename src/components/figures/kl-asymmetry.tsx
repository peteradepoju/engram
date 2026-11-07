"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

/** KL divergence between two distributions over ten outcomes, in both directions, and the cross-entropy. */
export function KLAsymmetry() {
  const [shift, setShift] = useState(1.5);
  const [width, setWidth] = useState(1.5);
  const K = 10, xs = Array.from({ length: K }, (_, i) => i);
  const norm = (v: number[]) => { const s = v.reduce((a, b) => a + b, 0); return v.map((x) => x / s); };
  const p = norm(xs.map((x) => 0.7 * Math.exp(-((x - 2.5) ** 2) / 1.2) + 0.3 * Math.exp(-((x - 7) ** 2) / 1.2) + 1e-3));
  const q = norm(xs.map((x) => Math.exp(-((x - 2.5 - shift) ** 2) / (2 * width * width)) + 1e-3));
  const kl = (a: number[], b: number[]) => a.reduce((t, ai, i) => t + ai * Math.log2(ai / b[i]), 0);
  const H = (a: number[]) => -a.reduce((t, ai) => t + ai * Math.log2(ai), 0);
  const ce = -p.reduce((t, pi, i) => t + pi * Math.log2(q[i]), 0);
  const W = 360, HH = 180, bw = (W - 40) / K, top = Math.max(...p, ...q) * 1.15;
  const Y = (v: number) => HH - 26 - (v / top) * (HH - 40);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${HH + 14}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Two distributions and the divergences between them">
        {xs.map((i) => (
          <g key={i}>
            <rect x={30 + i * bw + 2} y={Y(p[i])} width={bw / 2 - 2} height={HH - 26 - Y(p[i])} fill="var(--ink-2)" opacity="0.7" />
            <rect x={30 + i * bw + bw / 2} y={Y(q[i])} width={bw / 2 - 2} height={HH - 26 - Y(q[i])} fill="var(--neuro)" opacity="0.8" />
            <text x={30 + i * bw + bw / 2} y={HH - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{i}</text>
          </g>
        ))}
        <line x1="30" x2={W - 10} y1={HH - 26} y2={HH - 26} stroke="var(--line)" />
        <text x="30" y={HH + 8} fontSize="10" fill="var(--ink-2)">grey: true distribution p</text>
        <text x="190" y={HH + 8} fontSize="10" fill="var(--neuro)">pink: model q</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="model's centre (shift)" value={shift} min={-2} max={5} step={0.1} onChange={setShift} fmt={(v) => v.toFixed(1)} />
        <Slider label="model's width" value={width} min={0.4} max={4} step={0.05} onChange={setWidth} fmt={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="KL(p‖q) bits" value={kl(p, q).toFixed(3)} />
        <Stat label="KL(q‖p) bits" value={kl(q, p).toFixed(3)} />
        <Stat label="entropy H(p)" value={H(p).toFixed(3)} />
        <Stat label="cross-entropy H(p, q)" value={ce.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The KL divergence KL(p‖q) is the average number of extra bits needed to encode outcomes from p using a code designed for q. It is zero only when the two match, and it is not symmetric: here the two directions differ, sometimes by a lot. The cross-entropy H(p, q) is the entropy of p plus KL(p‖q), so minimising cross-entropy over the model q, as every classifier and language model does in training, is the same as minimising KL(p‖q).</p>
    </div>
  );
}
