"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Repeated sweeps of current through N independent channels (1 pA each) with a rising-then-inactivating open probability, and the across-sweep variance plotted against the mean, which follows iI - I²/N. */
export function ChannelNoise() {
  const [logN, setLogN] = useState(2.3);
  const N = Math.round(10 ** logN);
  const { sweeps, mean, vari, est } = useMemo(() => {
    const r = rng(1976 + N);
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    const T = 100, S = 40;
    const p = Array.from({ length: T }, (_, k) => { const t = k * 0.1; return Math.exp(-t / 3) - Math.exp(-t / 0.5); });
    const pm = Math.max(...p); for (let k = 0; k < T; k++) p[k] = (0.6 * p[k]) / pm;
    const draw = (q: number) => {
      if (N <= 150) { let n = 0; for (let j = 0; j < N; j++) if (r() < q) n++; return n; }
      return Math.max(0, Math.min(N, Math.round(N * q + Math.sqrt(N * q * (1 - q)) * gauss())));
    };
    const sweeps = Array.from({ length: S }, () => p.map((q) => draw(q)));
    const mean = p.map((_, k) => sweeps.reduce((a, s) => a + s[k], 0) / S);
    const vari = p.map((_, k) => sweeps.reduce((a, s) => a + (s[k] - mean[k]) ** 2, 0) / (S - 1));
    // least squares for v = i m - m^2 / N
    let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
    for (let k = 0; k < T; k++) { const x1 = mean[k], x2 = -(mean[k] ** 2); a11 += x1 * x1; a12 += x1 * x2; a22 += x2 * x2; b1 += x1 * vari[k]; b2 += x2 * vari[k]; }
    const det = a11 * a22 - a12 * a12, c1 = (b1 * a22 - b2 * a12) / det, c2 = (a11 * b2 - a12 * b1) / det;
    return { sweeps, mean, vari, est: { i: c1, N: c2 > 0 ? 1 / c2 : Infinity } };
  }, [N]);
  const W = 360, H = 260, x0 = 30, x1 = 350;
  const mmax = 0.6 * N;
  const Xt = (k: number) => x0 + (k / 99) * (x1 - x0);
  const Yt = (n: number) => 110 - (n / (0.75 * N)) * 95;
  const vmax = Math.max(N * 0.3, ...vari) * 1.05;
  const Xm = (m: number) => x0 + (m / (mmax * 1.05)) * (x1 - x0);
  const Yv = (v: number) => 250 - (v / vmax) * 110;
  const par = Array.from({ length: 60 }, (_, j) => (j / 59) * mmax).map((m) => `${Xm(m)},${Yv(m - (m * m) / N)}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Current sweeps from stochastic channels and the variance-mean parabola">
        <text x={x0} y="12" fontSize="9" fill="var(--ink-3)">open channels in 3 of 40 sweeps, and the mean</text>
        {sweeps.slice(0, 3).map((s, j) => <polyline key={j} points={s.map((n, k) => `${Xt(k)},${Yt(n)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1" opacity={0.5} />)}
        <polyline points={mean.map((n, k) => `${Xt(k)},${Yt(n)}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="2" />
        <text x={x1} y="124" fontSize="9" textAnchor="end" fill="var(--ink-3)">time (10 ms) →</text>
        <text x={x0} y="140" fontSize="9" fill="var(--ink-3)">variance against mean</text>
        <line x1={x0} x2={x1} y1="250" y2="250" stroke="var(--line)" />
        <polyline points={par} fill="none" stroke="var(--warn)" strokeWidth="1.8" />
        {mean.map((m, k) => <circle key={k} cx={Xm(m)} cy={Yv(vari[k])} r="2" fill="var(--neuro)" />)}
        <text x={x1} y="258" fontSize="9" textAnchor="end" fill="var(--ink-3)">mean current →</text>
      </svg>
      <Slider label="channels in the patch" value={logN} min={1} max={4} step={0.05} onChange={setLogN} fmt={() => `${N}`} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="true N" value={`${N}`} />
        <Stat label="estimated N" value={isFinite(est.N) ? `${Math.round(est.N)}` : "∞"} />
        <Stat label="estimated i" value={`${est.i.toFixed(2)} pA`} />
      </div>
      <p className="text-sm text-ink-2">Each sweep repeats the same stimulus; the channels open at random each time. With few channels the sweeps look like noisy staircases; with many they look smooth, but the variance across sweeps, plotted against the mean (orange: the theory, iI minus I²/N), still reveals how many channels there are. With only 40 sweeps the estimate is itself noisy: try several values of N.</p>
    </div>
  );
}
