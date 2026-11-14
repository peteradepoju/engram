"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const T = 60;

/** Filtering uses the past only; smoothing uses the whole recording, removing the lag. */
export function SmootherLag() {
  const [noise, setNoise] = useState(1.0);
  const res = useMemo(() => {
    const rnd = rng(653), a = 0.95, q = 0.15, z: number[] = [0], y: number[] = [];
    for (let t = 1; t < T; t++) z.push(a * z[t - 1] + Math.sqrt(q) * gauss(rnd) + (t === 25 ? 2.5 : 0));
    for (let t = 0; t < T; t++) y.push(z[t] + noise * gauss(rnd));
    const mf: number[] = [], Pf: number[] = [], mp: number[] = [], Pp: number[] = [];
    let m = 0, P = 1;
    for (let t = 0; t < T; t++) {
      const mpre = a * m, Ppre = a * a * P + q;
      mp.push(mpre); Pp.push(Ppre);
      const K = Ppre / (Ppre + noise * noise);
      m = mpre + K * (y[t] - mpre); P = (1 - K) * Ppre;
      mf.push(m); Pf.push(P);
    }
    const ms = mf.slice(), Ps = Pf.slice();
    for (let t = T - 2; t >= 0; t--) {
      const J = (a * Pf[t]) / Pp[t + 1];
      ms[t] = mf[t] + J * (ms[t + 1] - mp[t + 1]);
      Ps[t] = Pf[t] + J * J * (Ps[t + 1] - Pp[t + 1]);
    }
    const rmse = (e: number[]): number => Math.sqrt(e.reduce((s, v, i) => s + (v - z[i]) ** 2, 0) / T);
    return { z, y, mf, ms, Ps, Pf, rmseF: rmse(mf), rmseS: rmse(ms) };
  }, [noise]);
  const sx = (t: number): number => 18 + t * 5.2, sy = (v: number): number => 95 - v * 20;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 150" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Filtered and smoothed estimates">
        {res.y.map((v, t) => <circle key={t} cx={sx(t)} cy={sy(v)} r="1.5" fill="var(--ink-3)" opacity="0.7" />)}
        <polyline points={res.z.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.8" />
        <polyline points={res.mf.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1.6" />
        <polyline points={res.ms.map((v, t) => `${sx(t)},${sy(v)}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <text x="20" y="12" fontSize="8" fill="var(--ink)">true state</text>
        <text x="90" y="12" fontSize="8" fill="var(--neuro)">filtered (past only)</text>
        <text x="200" y="12" fontSize="8" fill="var(--ai)">smoothed (whole recording)</text>
      </svg>
      <Slider label="measurement noise" value={noise} min={0.1} max={3} step={0.05} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="error, filtered" value={res.rmseF.toFixed(3)} />
        <Stat label="error, smoothed" value={res.rmseS.toFixed(3)} />
        <Stat label="posterior sd at mid-recording" value={`${Math.sqrt(res.Pf[30]).toFixed(2)} / ${Math.sqrt(res.Ps[30]).toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">The state jumps at step 25. The filter, which sees only the past, lags behind the jump; the smoother, which uses the whole recording, places it correctly and is more accurate everywhere. Filtering is what a brain or a prosthesis must do online; smoothing is what an analysis of recorded data should do.</p>
    </div>
  );
}
