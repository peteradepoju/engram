"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

/** A one-dimensional random-walk state (process noise variance 1) observed with Gaussian noise; the Kalman filter's estimate, its steady-state gain and errors. */
export function KalmanTrack() {
  const [sdObs, setSdObs] = useState(4);
  const { xs, zs, ks, gain, errZ, errK } = useMemo(() => {
    const r = rng(1960), T = 120, xs: number[] = [], zs: number[] = [], ks: number[] = [];
    let x = 0, m = 0, P = 10, K = 0;
    for (let t = 0; t < T; t++) {
      x += gauss(r); const z = x + sdObs * gauss(r);
      P += 1; K = P / (P + sdObs * sdObs); m += K * (z - m); P *= 1 - K;
      xs.push(x); zs.push(z); ks.push(m);
    }
    const rms = (a: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - xs[i]) ** 2, 0) / T);
    return { xs, zs, ks, gain: K, errZ: rms(zs), errK: rms(ks) };
  }, [sdObs]);
  const all = [...xs, ...ks], lo = Math.min(...all) - 4, hi = Math.max(...all) + 4;
  const W = 360, H = 200, sx = (t: number) => 10 + (t / 119) * 340, sy = (v: number) => H - 10 - ((v - lo) / (hi - lo)) * (H - 20);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="A Kalman filter tracking a random walk from noisy measurements">
        {zs.map((z, t) => z > lo && z < hi ? <circle key={t} cx={sx(t)} cy={sy(z)} r="1.6" fill="var(--ink-3)" opacity="0.6" /> : null)}
        <polyline points={xs.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polyline points={ks.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="10" y="14" fontSize="9" fill="var(--ink-2)">black: true state</text>
        <text x="100" y="14" fontSize="9" fill="var(--ai)">blue: Kalman estimate</text>
        <text x="220" y="14" fontSize="9" fill="var(--ink-3)">grey: measurements</text>
      </svg>
      <Slider label="measurement noise (standard deviation)" value={sdObs} min={0.2} max={10} step={0.1} onChange={setSdObs} fmt={(v) => v.toFixed(1)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Kalman gain" value={gain.toFixed(2)} />
        <Stat label="error, raw" value={errZ.toFixed(2)} />
        <Stat label="error, Kalman" value={errK.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The state takes a random step of size about 1 each time. With precise measurements the gain is close to 1 and the filter simply follows them. As the measurements get noisier the gain falls, the filter trusts its prediction more and averages over more past measurements, and its error grows much more slowly than the raw measurement error. The gain settles to a constant within a few steps: for a fixed model, the Kalman filter becomes a fixed linear filter.</p>
    </div>
  );
}
