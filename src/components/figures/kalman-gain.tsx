"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const T = 60;

/** The Kalman filter on a one-dimensional random walk: the gain as a balance between process and measurement noise. */
export function KalmanGain() {
  const [q, setQ] = useState(0.2);
  const [r_, setR] = useState(1.0);
  const res = useMemo(() => {
    const rnd = rng(652), z: number[] = [0], y: number[] = [];
    for (let t = 1; t < T; t++) z.push(0.98 * z[t - 1] + Math.sqrt(0.2) * gauss(rnd));
    for (let t = 0; t < T; t++) y.push(z[t] + gauss(rnd));
    let m = 0, P = 1;
    const est: number[] = [], sd: number[] = [], gains: number[] = [];
    for (let t = 0; t < T; t++) {
      const mp = 0.98 * m, Pp = 0.98 * 0.98 * P + q;
      const K = Pp / (Pp + r_);
      m = mp + K * (y[t] - mp); P = (1 - K) * Pp;
      est.push(m); sd.push(Math.sqrt(P)); gains.push(K);
    }
    const rmse = Math.sqrt(est.reduce((s, v, i) => s + (v - z[i]) ** 2, 0) / T);
    const rmseY = Math.sqrt(y.reduce((s, v, i) => s + (v - z[i]) ** 2, 0) / T);
    return { z, y, est, sd, gain: gains[T - 1], rmse, rmseY };
  }, [q, r_]);
  const sx = (t: number): number => 18 + t * 5.2, sy = (v: number): number => 80 - v * 22;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Kalman filter estimate">
        <polygon points={res.est.map((v, t) => `${sx(t)},${sy(v + 2 * res.sd[t])}`).concat(res.est.slice().reverse().map((v, j) => { const t = T - 1 - j; return `${sx(t)},${sy(v - 2 * res.sd[t])}`; })).join(" ")} fill="var(--ai)" opacity="0.18" />
        {res.y.map((v, t) => <circle key={t} cx={sx(t)} cy={sy(v)} r="1.6" fill="var(--ink-3)" />)}
        <polyline points={res.z.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.8" />
        <polyline points={res.est.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="20" y="12" fontSize="8" fill="var(--ink)">true state</text>
        <text x="90" y="12" fontSize="8" fill="var(--ai)">filtered estimate</text>
        <text x="190" y="12" fontSize="8" fill="var(--ink-3)">measurements</text>
      </svg>
      <Slider label="assumed process noise" value={q} min={0.01} max={2} step={0.01} onChange={setQ} fmt={(v) => v.toFixed(2)} />
      <Slider label="assumed measurement noise" value={r_} min={0.05} max={5} step={0.05} onChange={setR} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="steady-state gain" value={res.gain.toFixed(3)} />
        <Stat label="error of the estimate" value={res.rmse.toFixed(3)} />
        <Stat label="error of raw measurements" value={res.rmseY.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The gain says how far to move towards each new measurement. Believing the state moves a lot (large process noise) or the sensor is good (small measurement noise) raises the gain and the estimate follows the data; the reverse gives a smooth, sluggish estimate. The true process noise is 0.2 and the true measurement noise 1.</p>
    </div>
  );
}
