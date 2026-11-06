"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

/** Decode a grating's orientation from a few tuned neurons' spike counts: prior times likelihood gives the posterior. */
export function BayesUpdate() {
  const [nNeur, setNNeur] = useState(4);
  const [priorW, setPriorW] = useState(25);
  const [seed, setSeed] = useState(1);
  const trueTheta = 70;
  const grid = Array.from({ length: 181 }, (_, i) => i);
  const prefs = Array.from({ length: nNeur }, (_, i) => (i * 180) / nNeur + 10);
  const rate = (th: number, p: number) => 1 + 9 * Math.exp(2 * (Math.cos((2 * (th - p) * Math.PI) / 180) - 1));
  const counts = useMemo(() => { const r = rng(seed * 131 + nNeur); return prefs.map((p) => poisson(rate(trueTheta, p), r)); }, [seed, nNeur]); // eslint-disable-line react-hooks/exhaustive-deps
  const circ = (d: number) => { const x = ((d % 180) + 180) % 180; return Math.min(x, 180 - x); };
  const prior = grid.map((t) => Math.exp(-(circ(t - 45) ** 2) / (2 * priorW * priorW)));
  const loglik = grid.map((t) => prefs.reduce((s, p, i) => s + counts[i] * Math.log(rate(t, p)) - rate(t, p), 0));
  const mx = Math.max(...loglik);
  const lik = loglik.map((l) => Math.exp(l - mx));
  const norm = (v: number[]) => { const s = v.reduce((a, b) => a + b, 0); return v.map((x) => x / s); };
  const P = norm(prior), L = norm(lik), post = norm(prior.map((p, i) => p * lik[i]));
  const top = Math.max(...P, ...L, ...post);
  const W = 360, H = 200, X = (t: number) => 30 + (t / 180) * (W - 40), Y = (v: number) => H - 26 - (v / top) * (H - 46);
  const line = (v: number[]) => v.map((p, i) => `${X(i)},${Y(p)}`).join(" ");
  const argmax = (v: number[]) => v.indexOf(Math.max(...v));
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Prior, likelihood and posterior over orientation">
        <polyline points={line(P)} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="5 3" />
        <polyline points={line(L)} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <polyline points={line(post)} fill="none" stroke="var(--neuro)" strokeWidth="3" />
        <line x1={X(trueTheta)} x2={X(trueTheta)} y1="12" y2={H - 26} stroke="var(--good)" strokeDasharray="3 3" />
        <line x1="30" x2={W - 10} y1={H - 26} y2={H - 26} stroke="var(--line)" />
        {[0, 45, 90, 135, 180].map((t) => <text key={t} x={X(t)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--ink-3)">{t}°</text>)}
        <text x={W - 10} y="16" fontSize="10" textAnchor="end" fill="var(--ink-3)">prior (dashed)</text>
        <text x={W - 10} y="29" fontSize="10" textAnchor="end" fill="var(--ai)">likelihood</text>
        <text x={W - 10} y="42" fontSize="10" textAnchor="end" fill="var(--neuro)">posterior</text>
        <text x={X(trueTheta) + 4} y="16" fontSize="10" fill="var(--good)">true 70°</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="neurons recorded" value={nNeur} min={1} max={24} step={1} onChange={setNNeur} />
        <Slider label="prior width (centred on 45°)" value={priorW} min={5} max={200} step={1} onChange={setPriorW} unit="°" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>New trial</button>
        <span className="text-sm text-ink-3">counts: {counts.join(", ")}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="maximum likelihood" value={`${argmax(L)}°`} />
        <Stat label="maximum posterior" value={`${argmax(post)}°`} />
        <Stat label="prior mode" value="45°" />
      </div>
      <p className="text-sm text-ink-2">Each neuron is tuned to a different orientation and fires a Poisson number of spikes. The likelihood (blue) says how probable this trial&apos;s counts are for each possible orientation; the prior (dashed) says which orientations the observer expects. Their product, normalised, is the posterior (pink). With few neurons the evidence is weak and the posterior leans towards the prior; with many neurons the likelihood is sharp and the prior hardly matters. Make the prior very narrow and it overrules the data.</p>
    </div>
  );
}
