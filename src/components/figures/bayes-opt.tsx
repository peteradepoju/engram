"use client";

import { useMemo, useState } from "react";
import { Slider, Stat } from "./util";
import { gpPosterior, rbf } from "./gp-lib";

const XS = Array.from({ length: 151 }, (_, i): number => i / 150);
const obj = (x: number): number => Math.exp(-((x - 0.72) ** 2) / 0.004) * 1.2 + 0.6 * Math.exp(-((x - 0.25) ** 2) / 0.02) + 0.1 * Math.sin(12 * x);
const phi = (z: number): number => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
const Phi = (z: number): number => 0.5 * (1 + Math.tanh(0.7978845608 * (z + 0.044715 * z ** 3)));

/** Bayesian optimisation of a neuron's response over stimulus space with expected improvement. */
export function BayesOpt() {
  const [steps, setSteps] = useState(3);
  const hist = useMemo(() => {
    const X = [0.1, 0.5, 0.9], out = [];
    for (let s = 0; s <= 12; s++) {
      const y = X.map(obj);
      const post = gpPosterior(rbf(0.08, 0.6), X, y, 1e-4, XS);
      const best = Math.max(...y);
      const ei = XS.map((_, i) => { const sd = Math.sqrt(post.vr[i]), z = (post.mean[i] - best) / sd; return sd * (z * Phi(z) + phi(z)); });
      const next = XS[ei.indexOf(Math.max(...ei))];
      out.push({ X: X.slice(), y, post, ei, next, best });
      X.push(next);
    }
    return out;
  }, []);
  const h = hist[steps];
  const sx = (x: number): number => 20 + x * 300, sy = (y: number): number => 100 - y * 55;
  const eiTop = Math.max(...h.ei, 1e-9);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Bayesian optimisation">
        <polyline points={XS.map((x) => `${sx(x)},${sy(obj(x))}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <polyline points={XS.map((x, i) => `${sx(x)},${sy(h.post.mean[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        {h.X.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(h.y[i])} r="3" fill="var(--neuro)" />)}
        <polyline points={XS.map((x, i) => `${sx(x)},${165 - (h.ei[i] / eiTop) * 30}`).join(" ")} fill="none" stroke="var(--warn)" strokeWidth="1.5" />
        <line x1={sx(h.next)} x2={sx(h.next)} y1="10" y2="165" stroke="var(--warn)" strokeDasharray="2 3" />
        <text x="22" y="12" fontSize="8" fill="var(--ink-3)">dashed: true response; blue: GP mean; orange: expected improvement</text>
      </svg>
      <Slider label="stimuli tested beyond the first three" value={steps} min={0} max={12} step={1} onChange={setSteps} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="best response found" value={h.best.toFixed(3)} />
        <Stat label="true best" value={Math.max(...XS.map(obj)).toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The response is expensive to measure, so each new stimulus is chosen where the expected improvement over the best so far is largest. That balances exploiting stimuli the GP predicts to be good with exploring stimuli it is uncertain about. The narrow peak near 0.72 is found within a few tests, though nothing pointed to it at first.</p>
    </div>
  );
}
