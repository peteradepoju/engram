"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Predictive coding inference on an 8x8 patch made of two bars: input, prediction and error. */
export function PredictiveCoding() {
  const [steps, setSteps] = useState(10);
  const [seed, setSeed] = useState(3);
  const P = 8;
  const res = useMemo(() => {
    const r = rng(seed * 13 + 1), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const B: number[][] = [];
    for (let i = 0; i < P; i++) {
      const h = new Array(64).fill(0), v = new Array(64).fill(0);
      for (let j = 0; j < P; j++) { h[i * P + j] = 1 / Math.sqrt(8); v[j * P + i] = 1 / Math.sqrt(8); }
      B.push(h, v);
    }
    const a = Math.floor(r() * 16); let b = Math.floor(r() * 16); if (b === a) b = (a + 3) % 16;
    const x = new Array(64).fill(0).map((_, p) => (0.5 + r()) * B[a][p] + (0.5 + r()) * B[b][p] + 0.05 * g());
    let R = new Array(16).fill(0);
    const pred = () => x.map((_, p) => R.reduce((s, rk, k) => s + B[k][p] * rk, 0));
    for (let t = 0; t < steps; t++) {
      const pr = pred(), e = x.map((v, p) => v - pr[p]);
      R = R.map((rk, k) => { const u = rk + 0.1 * B[k].reduce((s, w, p) => s + w * e[p], 0); return Math.sign(u) * Math.max(Math.abs(u) - 0.01, 0); });
    }
    const pr = pred(), e = x.map((v, p) => v - pr[p]);
    const norm = (v: number[]) => Math.sqrt(v.reduce((s, q) => s + q * q, 0));
    return { x, pr, e, rel: norm(e) / norm(x), top: R.map((v, k) => [Math.abs(v), k]).sort((p, q) => q[0] - p[0]).slice(0, 2).map((p) => p[1]), truth: [a, b] };
  }, [steps, seed]);
  const panel = (v: number[], ox: number, label: string) => {
    const m = Math.max(...res.x.map(Math.abs), 0.01);
    return (
      <g>
        {v.map((q, i) => <rect key={i} x={ox + (i % P) * 11} y={20 + Math.floor(i / P) * 11} width="10.5" height="10.5" fill={q >= 0 ? "var(--neuro)" : "var(--ai)"} opacity={Math.min(1, Math.abs(q) / m)} />)}
        <rect x={ox} y="20" width="88" height="88" fill="none" stroke="var(--line)" />
        <text x={ox + 44} y="122" fontSize="9" textAnchor="middle" fill="var(--ink-2)">{label}</text>
      </g>
    );
  };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 132" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Input, prediction and error">
        {panel(res.x, 18, "input")}
        {panel(res.pr, 136, "top-down prediction")}
        {panel(res.e, 254, "error")}
      </svg>
      <Slider label="inference steps" value={steps} min={0} max={60} step={1} onChange={setSteps} />
      <Slider label="patch" value={seed} min={1} max={20} step={1} onChange={setSeed} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="error / input" value={res.rel.toFixed(2)} />
        <Stat label="causes found" value={`${res.top.sort((p, q) => p - q).join(", ")} (true ${res.truth.sort((p, q) => p - q).join(", ")})`} />
      </div>
      <p className="text-sm text-ink-2">At step 0 there is no prediction and the error is the whole input. As inference proceeds the prediction fills in the two bars and the error fades to noise.</p>
    </div>
  );
}
