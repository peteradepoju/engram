"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const Z = Array.from({ length: 401 }, (_, i): number => -4 + i * 0.02);
const X_OBS = 1.2, SX = 0.4;
const lprior = (z: number): number => -0.5 * z * z - 0.5 * Math.log(2 * Math.PI);
const llik = (z: number): number => -0.5 * ((X_OBS - z * z) / SX) ** 2 - Math.log(SX * Math.sqrt(2 * Math.PI));

/** The ELBO for one observation of a model whose posterior is bimodal, against the log evidence, for a Gaussian q. */
export function ElboGap() {
  const [mu, setMu] = useState(0.5);
  const [sd, setSd] = useState(0.5);
  const lj = Z.map((z) => lprior(z) + llik(z));
  const mx = Math.max(...lj);
  const ev = Z.reduce((s, _, i) => s + Math.exp(lj[i] - mx) * 0.02, 0);
  const logEv = mx + Math.log(ev);
  const post = lj.map((v) => Math.exp(v - logEv));
  const q = Z.map((z) => Math.exp(-0.5 * ((z - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI)));
  const elbo = Z.reduce((s, _, i) => (q[i] > 1e-12 ? s + q[i] * (lj[i] - Math.log(q[i])) * 0.02 : s), 0);
  const sx = (z: number): number => 20 + ((z + 3) / 6) * 300, top = Math.max(...post, ...q);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Posterior and variational approximation">
        <polyline points={Z.map((z, i) => `${sx(z)},${140 - (post[i] / top) * 120}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={Z.map((z, i) => `${sx(z)},${140 - (q[i] / top) * 120}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" strokeDasharray="5 3" />
        <line x1="20" x2="320" y1="140" y2="140" stroke="var(--line)" />
        <text x="24" y="14" fontSize="8" fill="var(--neuro)">true posterior p(z | x)</text>
        <text x="140" y="14" fontSize="8" fill="var(--ai)">Gaussian q(z)</text>
        <text x="318" y="155" fontSize="8" textAnchor="end" fill="var(--ink-3)">latent z</text>
      </svg>
      <Slider label="mean of q" value={mu} min={-2} max={2} step={0.02} onChange={setMu} fmt={(v) => v.toFixed(2)} />
      <Slider label="standard deviation of q" value={sd} min={0.05} max={1.5} step={0.01} onChange={setSd} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="log evidence" value={logEv.toFixed(3)} />
        <Stat label="ELBO" value={elbo.toFixed(3)} />
        <Stat label="gap = KL(q ‖ posterior)" value={(logEv - elbo).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The observation x = z² + noise cannot tell whether z was positive or negative, so the posterior has two peaks. The ELBO is always below the log evidence, by exactly the KL divergence from q to the posterior. The best Gaussian sits on one peak rather than spreading over both: covering both would put mass where the posterior has almost none, which KL(q ‖ p) punishes heavily.</p>
    </div>
  );
}
