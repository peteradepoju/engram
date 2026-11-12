"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Average reward over time for epsilon-greedy, softmax and UCB on a 10-armed bandit. */
export function BanditStrategies() {
  const [eps, setEps] = useState(0.1);
  const [beta, setBeta] = useState(3);
  const [c, setC] = useState(1);
  const K = 10, T = 400, R = 150;
  const curves = useMemo(() => {
    const r = rng(2006);
    const g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const mus = Array.from({ length: R }, () => Array.from({ length: K }, g));
    const run = (pol: string) => {
      const avg = new Array(T).fill(0);
      for (let k = 0; k < R; k++) {
        const mu = mus[k], best = Math.max(...mu), Q = new Array(K).fill(0), N = new Array(K).fill(0);
        for (let t = 0; t < T; t++) {
          let a = 0;
          if (pol === "eps") {
            if (r() < eps) a = Math.floor(r() * K); else a = Q.indexOf(Math.max(...Q));
          } else if (pol === "soft") {
            const m = Math.max(...Q), p = Q.map((q) => Math.exp(beta * (q - m))), s = p.reduce((x, y) => x + y, 0);
            let u = r() * s; a = 0; while (a < K - 1 && u > p[a]) { u -= p[a]; a++; }
          } else {
            let bestV = -Infinity;
            for (let j = 0; j < K; j++) { const v = N[j] === 0 ? 1e9 : Q[j] + c * Math.sqrt(Math.log(t + 1) / N[j]); if (v > bestV) { bestV = v; a = j; } }
          }
          const rew = mu[a] + g(); N[a]++; Q[a] += (rew - Q[a]) / N[a];
          avg[t] += (mu[a] / best) / R;
        }
      }
      return avg;
    };
    return { eps: run("eps"), soft: run("soft"), ucb: run("ucb") };
  }, [eps, beta, c]);
  const W = 360, H = 170, sx = (t: number) => 30 + (t / T) * 310, sy = (v: number) => H - 20 - Math.max(0, v) * (H - 40);
  const smooth = (a: number[]) => a.map((_, i) => { const lo = Math.max(0, i - 10); const s = a.slice(lo, i + 1); return s.reduce((x, y) => x + y, 0) / s.length; });
  const lines: [string, number[], string][] = [["ε-greedy", smooth(curves.eps), "var(--neuro)"], ["softmax", smooth(curves.soft), "var(--ai)"], ["UCB", smooth(curves.ucb), "var(--ink-2)"]];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Bandit strategies">
        <line x1="30" x2="340" y1={sy(1)} y2={sy(1)} stroke="var(--line)" strokeDasharray="3 3" />
        <line x1="30" x2="340" y1={sy(0)} y2={sy(0)} stroke="var(--line)" />
        <text x="26" y={sy(1) + 3} fontSize="8" textAnchor="end" fill="var(--ink-3)">best</text>
        {lines.map(([nm, a, col], i) => (
          <g key={nm}>
            <polyline points={a.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke={col} strokeWidth="1.8" />
            <text x={40 + i * 60} y={H - 6} fontSize="9" fill={col}>{nm}</text>
          </g>
        ))}
        <text x="340" y={H - 6} fontSize="8" textAnchor="end" fill="var(--ink-3)">step</text>
      </svg>
      <Slider label="ε (epsilon-greedy)" value={eps} min={0} max={0.5} step={0.01} onChange={setEps} fmt={(v) => v.toFixed(2)} />
      <Slider label="β (softmax)" value={beta} min={0.2} max={10} step={0.2} onChange={setBeta} fmt={(v) => v.toFixed(1)} />
      <Slider label="c (UCB bonus)" value={c} min={0} max={3} step={0.1} onChange={setC} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        {lines.map(([nm, a]) => <Stat key={nm} label={nm} value={`${Math.round(100 * a[T - 1])}%`} />)}
      </div>
      <p className="text-sm text-ink-2">Each curve is the expected reward of the chosen arm as a fraction of the best arm&apos;s, averaged over 150 random bandits. With ε = 0 or c = 0 the strategies become greedy and stall.</p>
    </div>
  );
}
