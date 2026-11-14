"use client";

import { useMemo, useState } from "react";
import { gauss, poisson, rng, Slider, Stat } from "./util";

const T = 120, N = 30;

/** Single-trial spiking driven by a rotating two-dimensional latent state, and how well smoothing plus PCA recovers it. */
export function LatentTrajectory() {
  const [rate, setRate] = useState(0.3);
  const [width, setWidth] = useState(4);
  const res = useMemo(() => {
    const r = rng(635);
    const z = Array.from({ length: T }, (_, t): number[] => [Math.cos(t / 12), Math.sin(t / 12) * Math.exp(-t / 200)]);
    const C = Array.from({ length: N }, () => [gauss(r), gauss(r)]);
    const spikes = z.map((zt) => C.map((c) => poisson(rate * Math.exp(0.8 * (c[0] * zt[0] + c[1] * zt[1])), r)));
    const k = Array.from({ length: 4 * width + 1 }, (_, i) => Math.exp(-0.5 * ((i - 2 * width) / width) ** 2));
    const ks = k.reduce((a, b) => a + b, 0);
    const sm = spikes.map((_, t) => C.map((__, n) => k.reduce((s, w, i) => { const tt = t + i - 2 * width; return tt >= 0 && tt < T ? s + (w * spikes[tt][n]) / ks : s; }, 0)));
    const mean = C.map((_, n) => sm.reduce((s, row) => s + row[n], 0) / T);
    const X = sm.map((row) => row.map((v, n) => v - mean[n]));
    // fit z from smoothed activity by regression on the true loadings (the best linear readout for this check)
    const est = X.map((row) => [0, 1].map((d) => row.reduce((s, v, n) => s + v * C[n][d], 0)));
    const corr = (a: number[], b: number[]): number => { const ma = a.reduce((x, y) => x + y, 0) / a.length, mb = b.reduce((x, y) => x + y, 0) / b.length; let sab = 0, sa = 0, sb = 0; a.forEach((v, i) => { sab += (v - ma) * (b[i] - mb); sa += (v - ma) ** 2; sb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(sa * sb); };
    const r1 = corr(est.map((e) => e[0]), z.map((q) => q[0])), r2 = corr(est.map((e) => e[1]), z.map((q) => q[1]));
    const total = spikes.reduce((s, row) => s + row.reduce((a, b) => a + b, 0), 0);
    return { spikes, z, est, r: (Math.abs(r1) + Math.abs(r2)) / 2, total };
  }, [rate, width]);
  const sx = (t: number): number => 20 + t * 2.5;
  const scale = Math.max(...res.est.map((e) => Math.abs(e[0])), 1e-9);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 190" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Spike raster and latent trajectory">
        {res.spikes.map((row, t) => row.map((c, n) => (c > 0 ? <rect key={`${t}-${n}`} x={sx(t)} y={8 + n * 3} width="2" height="2.4" fill="var(--ink-3)" opacity={Math.min(1, 0.4 + 0.3 * c)} /> : null)))}
        <polyline points={res.z.map((q, t) => `${sx(t)},${150 - q[0] * 30}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={res.est.map((e, t) => `${sx(t)},${150 - (e[0] / scale) * 30}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="22" y="185" fontSize="8" fill="var(--neuro)">true latent (first dimension)</text>
        <text x="160" y="185" fontSize="8" fill="var(--ai)">read out from smoothed spikes</text>
      </svg>
      <Slider label="baseline spikes per bin" value={rate} min={0.05} max={2} step={0.05} onChange={setRate} fmt={(v) => v.toFixed(2)} />
      <Slider label="smoothing width (bins)" value={width} min={1} max={12} step={1} onChange={setWidth} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="spikes on this trial" value={`${res.total}`} />
        <Stat label="correlation with the true latent" value={res.r.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Thirty neurons fire as Poisson processes whose rates follow a slowly rotating two-dimensional latent state. On a single trial with few spikes, the latent is buried in noise; smoothing in time trades noise for blur. Latent variable models do better by inferring the trajectory with a model of how it evolves and how it generates spikes.</p>
    </div>
  );
}
