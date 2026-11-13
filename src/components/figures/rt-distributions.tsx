"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Response time distributions of the drift diffusion model for correct and error responses. */
export function RTDistributions() {
  const [v, setV] = useState(1.0);
  const [a, setA] = useState(1.2);
  const [ter, setTer] = useState(0.3);
  const sim = useMemo(() => {
    const r = rng(2008), n = 2000, dt = 0.002, sq = Math.sqrt(dt);
    const g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const cor: number[] = [], err: number[] = [];
    for (let i = 0; i < n; i++) {
      let x = a / 2, t = 0;
      while (x > 0 && x < a && t < 5) { x += v * dt + sq * g(); t += dt; }
      (x >= a ? cor : err).push(t + ter);
    }
    return { cor, err };
  }, [v, a, ter]);
  const tmax = 2.5, nb = 50, bw = tmax / nb;
  const hist = (xs: number[]) => { const h = new Array(nb).fill(0); xs.forEach((x) => { const b = Math.floor(x / bw); if (b < nb) h[b]++; }); return h; };
  const hc = hist(sim.cor), he = hist(sim.err), m = Math.max(...hc, ...he, 1);
  const mean = (xs: number[]) => (xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : NaN);
  const W = 360, H = 180, mid = 95, sc = 75 / m;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Response time distributions">
        {hc.map((c, i) => <rect key={`c${i}`} x={30 + i * 6.2} y={mid - c * sc} width="5.6" height={c * sc} fill="var(--ai)" opacity="0.8" />)}
        {he.map((c, i) => <rect key={`e${i}`} x={30 + i * 6.2} y={mid} width="5.6" height={c * sc} fill="var(--neuro)" opacity="0.8" />)}
        <line x1="30" x2="340" y1={mid} y2={mid} stroke="var(--line)" />
        <text x="34" y="16" fontSize="9" fill="var(--ai)">correct</text>
        <text x="34" y={H - 8} fontSize="9" fill="var(--neuro)">errors</text>
        {[0.5, 1, 1.5, 2].map((t) => <text key={t} x={30 + (t / bw) * 6.2} y={mid + 10} fontSize="7" textAnchor="middle" fill="var(--ink-3)">{t} s</text>)}
      </svg>
      <Slider label="drift rate v" value={v} min={0} max={3} step={0.1} onChange={setV} fmt={(x) => x.toFixed(1)} />
      <Slider label="boundary separation a" value={a} min={0.4} max={2.4} step={0.1} onChange={setA} fmt={(x) => x.toFixed(1)} />
      <Slider label="non-decision time" value={ter} min={0.1} max={0.6} step={0.05} onChange={setTer} unit="s" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="accuracy" value={(sim.cor.length / (sim.cor.length + sim.err.length)).toFixed(2)} />
        <Stat label="mean RT correct" value={`${mean(sim.cor).toFixed(2)} s`} />
        <Stat label="mean RT error" value={sim.err.length ? `${mean(sim.err).toFixed(2)} s` : "none"} />
      </div>
      <p className="text-sm text-ink-2">Raising the bound shifts the distributions right and stretches their tails; raising the drift makes errors rarer and responses faster; the non-decision time slides everything without changing its shape.</p>
    </div>
  );
}
