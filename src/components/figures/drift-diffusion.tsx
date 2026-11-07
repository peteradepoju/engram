"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The drift diffusion model: evidence x accumulates with drift μ and noise σ until it hits +a (correct) or −a (error). */
export function DriftDiffusion() {
  const [mu, setMu] = useState(1);
  const [a, setA] = useState(1);
  const sigma = 1, dt = 0.005, nTr = 400;
  const { paths, rtC, rtE } = useMemo(() => {
    const r = rng(2007), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    const paths: number[][] = [], rtC: number[] = [], rtE: number[] = [];
    for (let i = 0; i < nTr; i++) {
      let x = 0, t = 0; const p = [0];
      while (Math.abs(x) < a && t < 5) { x += mu * dt + sigma * Math.sqrt(dt) * g(); t += dt; if (i < 12) p.push(x); }
      if (i < 12) paths.push(p);
      (x >= a ? rtC : rtE).push(t);
    }
    return { paths, rtC, rtE };
  }, [mu, a]);
  const W = 360, H = 220, Tm = 2.5, X = (t: number) => 20 + (t / Tm) * (W - 30), Y = (x: number) => 110 - (x / a) * 60;
  const binsOf = (arr: number[]) => { const b = new Array(25).fill(0); arr.forEach((t) => { b[Math.min(24, Math.floor((t / Tm) * 25))]++; }); return b; };
  const bC = binsOf(rtC), bE = binsOf(rtE), hScale = 40 / Math.max(1, ...bC, ...bE);
  const hist = (b: number[], sign: number) => b.map((c, k) => <rect key={k} x={X((k * Tm) / 25)} y={sign > 0 ? Y(a) - 4 - c * hScale : Y(-a) + 4} width={(W - 30) / 25 - 1} height={c * hScale} fill={sign > 0 ? "var(--good)" : "var(--warn)"} opacity="0.7" />);
  const acc = rtC.length / nTr, theoryAcc = 1 / (1 + Math.exp((-2 * mu * a) / sigma ** 2));
  const meanRT = [...rtC, ...rtE].reduce((s, t) => s + t, 0) / nTr, theoryRT = mu === 0 ? (a * a) / sigma ** 2 : (a / mu) * Math.tanh((a * mu) / sigma ** 2);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Evidence traces between two bounds with reaction time histograms">
        <line x1="20" x2={W - 10} y1={Y(a)} y2={Y(a)} stroke="var(--good)" />
        <line x1="20" x2={W - 10} y1={Y(-a)} y2={Y(-a)} stroke="var(--warn)" />
        <line x1="20" x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--line)" strokeDasharray="3 3" />
        {paths.map((p, i) => <polyline key={i} points={p.map((x, k) => `${X(k * dt)},${Y(x)}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="0.9" opacity="0.7" />)}
        {hist(bC, 1)}{hist(bE, -1)}
        <text x={W - 12} y={Y(a) + 12} fontSize="9" textAnchor="end" fill="var(--good)">correct bound +a</text>
        <text x={W - 12} y={Y(-a) - 5} fontSize="9" textAnchor="end" fill="var(--warn)">error bound −a</text>
        <text x={W - 12} y={H - 4} fontSize="9" textAnchor="end" fill="var(--ink-3)">time (s)</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="drift μ (evidence strength)" value={mu} min={0} max={3} step={0.05} onChange={setMu} />
        <Slider label="bound a (caution)" value={a} min={0.3} max={2} step={0.05} onChange={setA} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="accuracy (theory)" value={`${(acc * 100).toFixed(0)}% (${(theoryAcc * 100).toFixed(0)}%)`} />
        <Stat label="mean decision time (theory)" value={`${meanRT.toFixed(2)} s (${theoryRT.toFixed(2)})`} />
      </div>
      <p className="text-sm text-ink-2">Noisy evidence is added up until it reaches one of two bounds. Stronger evidence (larger drift) gives faster, more accurate decisions; a higher bound trades speed for accuracy. The histograms above and below show when each bound was reached: skewed to the right, as real reaction times are, and in this simplest version errors are rarer than correct choices but have exactly the same distribution of times.</p>
    </div>
  );
}
