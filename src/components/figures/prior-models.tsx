"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Priors computed by a Bayesian block observer, a stimulus kernel and an action kernel on a simulated IBL session. */
export function PriorModels() {
  const [alpha, setAlpha] = useState(0.2);
  const [h, setH] = useState(0.02);
  const sim = useMemo(() => {
    const r = rng(51);
    const T = 160;
    const block: number[] = [], side: number[] = [], act: number[] = [];
    let b = r() < 0.5 ? 1 : -1, left = 0;
    for (let t = 0; t < T; t++) {
      if (left <= 0) { b = -b; left = 20 + Math.floor(-Math.log(1 - r()) * 30); if (left > 100) left = 100; }
      left--;
      block.push(b);
      const s = r() < 0.8 ? b : -b;
      side.push(s);
      act.push(r() < 0.78 ? s : -s);
    }
    return { T, block, side, act };
  }, []);
  const { T, block, side, act } = sim;
  const kern = (x: number[]): number[] => { const out: number[] = []; let p = 0; for (let t = 0; t < T; t++) { out.push(p); p = (1 - alpha) * p + alpha * x[t]; } return out; };
  const bayes: number[] = [];
  let q = 0.5;
  for (let t = 0; t < T; t++) {
    const pr = 0.8 * q + 0.2 * (1 - q);
    bayes.push(Math.log(pr / (1 - pr)) / Math.log(4));
    const lr = side[t] > 0 ? 0.8 : 0.2, ll = side[t] > 0 ? 0.2 : 0.8;
    q = (q * lr) / (q * lr + (1 - q) * ll);
    q = (1 - h) * q + h * (1 - q);
  }
  const ks = kern(side), ka = kern(act);
  const lagToFlip = (p: number[]): number => {
    const lags: number[] = [];
    for (let t = 1; t < T; t++) if (block[t] !== block[t - 1]) {
      let k = 0; while (t + k < T && Math.sign(p[t + k]) !== block[t]) k++;
      if (t + k < T) lags.push(k);
    }
    return lags.reduce((a, c) => a + c, 0) / Math.max(lags.length, 1);
  };
  const sx = (t: number): number => 20 + (t / T) * 330, sy = (v: number): number => 95 - v * 60;
  const lines: [number[], string, string][] = [[bayes, "var(--ink)", "Bayesian observer"], [ks, "var(--ai)", "stimulus kernel"], [ka, "var(--neuro)", "action kernel"]];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 190" className="mx-auto w-full max-w-[500px] rounded-lg bg-surface-2" role="img" aria-label="Priors computed by three models">
        {block.map((b, t) => <rect key={t} x={sx(t)} y="30" width={330 / T + 0.3} height="130" fill={b > 0 ? "var(--neuro)" : "var(--ai)"} opacity="0.07" />)}
        <line x1="20" x2="350" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        {side.map((s, t) => <line key={t} x1={sx(t)} x2={sx(t)} y1={s > 0 ? 166 : 172} y2={s > 0 ? 170 : 176} stroke={act[t] !== s ? "var(--warn)" : "var(--ink-3)"} strokeWidth="1" />)}
        {lines.map(([v, col, nm]) => <polyline key={nm} points={v.map((x, t) => `${sx(t)},${sy(x)}`).join(" ")} fill="none" stroke={col} strokeWidth="1.5" />)}
        {lines.map(([, col, nm], k) => <text key={nm} x={22 + k * 105} y="14" fontSize="8" fill={col}>{nm}</text>)}
        <text x="22" y="26" fontSize="7" fill="var(--ink-3)">shading: true block (right or left); ticks below: stimulus side, errors highlighted</text>
        <text x="350" y="187" fontSize="8" textAnchor="end" fill="var(--ink-3)">trial</text>
      </svg>
      <Slider label="kernel rate α" value={alpha} min={0.02} max={0.6} step={0.01} onChange={setAlpha} fmt={(v) => v.toFixed(2)} />
      <Slider label="observer's switch rate h" value={h} min={0.002} max={0.2} step={0.002} onChange={setH} fmt={(v) => v.toFixed(3)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Bayes: trials to flip" value={lagToFlip(bayes).toFixed(1)} />
        <Stat label="stimulus: trials to flip" value={lagToFlip(ks).toFixed(1)} />
        <Stat label="action: trials to flip" value={lagToFlip(ka).toFixed(1)} />
      </div>
      <p className="text-sm text-ink-2">All three priors follow the blocks. The kernels jitter with every trial, and the action kernel is also pushed by the simulated mouse's errors. The Bayesian prior is scaled by log 4 so that all three share the range from −1 to 1.</p>
    </div>
  );
}
