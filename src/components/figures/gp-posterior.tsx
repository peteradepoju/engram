"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";
import { gpPosterior, rbf } from "./gp-lib";

const XS = Array.from({ length: 121 }, (_, i): number => -3 + i * 0.05);
const f = (x: number): number => Math.sin(1.5 * x) + 0.3 * x;

/** Gaussian-process regression: posterior mean and uncertainty as data accumulate. */
export function GpPosterior() {
  const [n, setN] = useState(6);
  const [noise, setNoise] = useState(0.2);
  const res = useMemo(() => {
    const r = rng(643);
    const X = Array.from({ length: 30 }, () => -2.8 + 5.6 * r()), e = X.map(() => gauss(r));
    const Xn = X.slice(0, n), yn = Xn.map((x, i) => f(x) + noise * e[i]);
    const post = gpPosterior(rbf(0.8), Xn, yn, noise * noise + 1e-6, XS);
    return { Xn, yn, ...post };
  }, [n, noise]);
  const sx = (x: number): number => 20 + ((x + 3) / 6) * 300, sy = (y: number): number => 80 - y * 25;
  const band = XS.map((x, i) => `${sx(x)},${sy(res.mean[i] + 2 * Math.sqrt(res.vr[i]))}`).concat(XS.slice().reverse().map((x, j) => { const i = XS.length - 1 - j; return `${sx(x)},${sy(res.mean[i] - 2 * Math.sqrt(res.vr[i]))}`; })).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Gaussian process posterior">
        <polygon points={band} fill="var(--ai)" opacity="0.18" />
        <polyline points={XS.map((x) => `${sx(x)},${sy(f(x))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <polyline points={XS.map((x, i) => `${sx(x)},${sy(res.mean[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {res.Xn.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(res.yn[i])} r="3" fill="var(--neuro)" />)}
      </svg>
      <Slider label="observations" value={n} min={0} max={30} step={1} onChange={setN} />
      <Slider label="noise sd" value={noise} min={0.02} max={0.8} step={0.02} onChange={setNoise} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="largest posterior sd" value={Math.sqrt(Math.max(...res.vr)).toFixed(2)} />
        <Stat label="smallest posterior sd" value={Math.sqrt(Math.min(...res.vr)).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The posterior mean (solid) passes near the observations and returns to the prior mean, zero, far from them; the band is two posterior standard deviations. Uncertainty shrinks where there are data and grows in the gaps, which is the information a decoder or an experimenter choosing the next stimulus needs.</p>
    </div>
  );
}
