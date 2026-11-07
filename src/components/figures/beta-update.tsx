"use client";

import { useState } from "react";
import { Slider, Stat } from "./util";

const lgamma = (x: number): number => { // Lanczos approximation
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1; let a = c[0]; const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
};
const betaPdf = (p: number, a: number, b: number) => Math.exp((a - 1) * Math.log(Math.max(p, 1e-12)) + (b - 1) * Math.log(Math.max(1 - p, 1e-12)) + lgamma(a + b) - lgamma(a) - lgamma(b));

/** Beta-binomial updating: a beta prior on a release (or success) probability, updated trial by trial. */
export function BetaUpdate() {
  const [a0, setA0] = useState(2);
  const [b0, setB0] = useState(2);
  const [succ, setSucc] = useState(0);
  const [fail, setFail] = useState(0);
  const a = a0 + succ, b = b0 + fail;
  const ps = Array.from({ length: 201 }, (_, i) => 0.0025 + (i / 200) * 0.995);
  const post = ps.map((p) => betaPdf(p, a, b)), prior = ps.map((p) => betaPdf(p, a0, b0));
  const top = Math.max(...post, ...prior) * 1.1;
  const W = 360, H = 190, X = (p: number) => 20 + p * (W - 30), Y = (d: number) => H - 26 - (d / top) * (H - 40);
  // 95% central credible interval from the discretised posterior
  const cdf: number[] = []; post.reduce((s, v, i) => { cdf[i] = s + v; return s + v; }, 0);
  const tot = cdf[cdf.length - 1], lo = ps[cdf.findIndex((c) => c / tot >= 0.025)], hi = ps[cdf.findIndex((c) => c / tot >= 0.975)];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H + 14}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Beta prior and posterior">
        <rect x={X(lo)} y="12" width={X(hi) - X(lo)} height={H - 38} fill="var(--accent)" opacity="0.12" />
        <polyline points={ps.map((p, i) => `${X(p)},${Y(prior[i])}`).join(" ")} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="5 3" />
        <polyline points={ps.map((p, i) => `${X(p)},${Y(post[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2.5" />
        <line x1="20" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={X(v)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{v}</text>)}
        <text x="20" y={H + 8} fontSize="10" fill="var(--ink-3)">dashed: prior Beta({a0}, {b0})</text>
        <text x="170" y={H + 8} fontSize="10" fill="var(--neuro)">posterior Beta({a}, {b})</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        <button className="btn !py-1.5" onClick={() => setSucc(succ + 1)}>Release (success)</button>
        <button className="btn !py-1.5" onClick={() => setFail(fail + 1)}>Failure</button>
        <button className="btn !py-1.5" onClick={() => { setSucc(succ + 3); setFail(fail + 7); }}>+10 trials at 30%</button>
        <button className="btn !py-1.5" onClick={() => { setSucc(0); setFail(0); }}>Reset</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="prior a (pseudo-successes)" value={a0} min={0.5} max={30} step={0.5} onChange={setA0} />
        <Slider label="prior b (pseudo-failures)" value={b0} min={0.5} max={30} step={0.5} onChange={setB0} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="data" value={`${succ} of ${succ + fail}`} />
        <Stat label="posterior mean" value={(a / (a + b)).toFixed(3)} />
        <Stat label="95% credible interval" value={`${lo.toFixed(2)} to ${hi.toFixed(2)}`} />
      </div>
      <p className="text-sm text-ink-2">A synapse releases with an unknown probability p. A beta prior is like having already seen a pseudo-successes and b pseudo-failures. Each real trial adds one to a or b, so the posterior is again a beta distribution: conjugacy. A confident prior (large a + b) needs many trials to move; a vague one follows the data almost at once. The shaded band holds 95% of the posterior probability.</p>
    </div>
  );
}
