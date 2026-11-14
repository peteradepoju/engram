"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const N = 300;
const npdf = (x: number, m: number, s: number): number => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

/** EM for a two-component Gaussian mixture in one dimension, iteration by iteration. */
export function GmmEm() {
  const [it, setIt] = useState(0);
  const data = useMemo(() => { const r = rng(602); return Array.from({ length: N }, (_, i): number => (i < 180 ? -1 + 0.6 * gauss(r) : 1.4 + 0.9 * gauss(r))); }, []);
  const hist = useMemo(() => {
    let pi = 0.5, m = [-0.2, 0.2], s = [1.5, 1.5];
    const out: { pi: number; m: number[]; s: number[]; ll: number }[] = [];
    for (let t = 0; t <= 30; t++) {
      const resp = data.map((x) => { const a = pi * npdf(x, m[0], s[0]), b = (1 - pi) * npdf(x, m[1], s[1]); return a / (a + b); });
      const ll = data.reduce((acc, x) => acc + Math.log(pi * npdf(x, m[0], s[0]) + (1 - pi) * npdf(x, m[1], s[1])), 0) / N;
      out.push({ pi, m: m.slice(), s: s.slice(), ll });
      const n0 = resp.reduce((a, b) => a + b, 0), n1 = N - n0;
      const m0 = data.reduce((a, x, i) => a + resp[i] * x, 0) / n0, m1 = data.reduce((a, x, i) => a + (1 - resp[i]) * x, 0) / n1;
      s = [Math.sqrt(data.reduce((a, x, i) => a + resp[i] * (x - m0) ** 2, 0) / n0), Math.sqrt(data.reduce((a, x, i) => a + (1 - resp[i]) * (x - m1) ** 2, 0) / n1)];
      m = [m0, m1]; pi = n0 / N;
    }
    return out;
  }, [data]);
  const h = hist[it];
  const bins = Array.from({ length: 36 }, () => 0);
  data.forEach((x) => { const k = Math.floor((x + 3) / (7 / 36)); if (k >= 0 && k < 36) bins[k]++; });
  const sx = (x: number): number => 20 + ((x + 3) / 7) * 300, scale = 130 / 0.55;
  const grid = Array.from({ length: 141 }, (_, i): number => -3 + i * 0.05);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="EM for a Gaussian mixture">
        {bins.map((c, k) => <rect key={k} x={sx(-3 + (k * 7) / 36)} y={150 - (c / (N * (7 / 36))) * scale} width={300 / 36 - 1} height={(c / (N * (7 / 36))) * scale} fill="var(--ink-3)" opacity="0.35" />)}
        <polyline points={grid.map((x) => `${sx(x)},${150 - h.pi * npdf(x, h.m[0], h.s[0]) * scale}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={grid.map((x) => `${sx(x)},${150 - (1 - h.pi) * npdf(x, h.m[1], h.s[1]) * scale}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1="20" x2="320" y1="150" y2="150" stroke="var(--line)" />
        <text x="320" y="164" fontSize="8" textAnchor="end" fill="var(--ink-3)">feature value (for example, spike width)</text>
      </svg>
      <Slider label="EM iteration" value={it} min={0} max={30} step={1} onChange={setIt} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="means" value={`${h.m[0].toFixed(2)}, ${h.m[1].toFixed(2)}`} />
        <Stat label="weight of first" value={h.pi.toFixed(2)} />
        <Stat label="log-likelihood per point" value={h.ll.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The E step computes, for every point, the probability that each component generated it; the M step refits each component's weight, mean and spread using those probabilities as soft counts. The log-likelihood never decreases. The true mixture has 60% of points at −1 (sd 0.6) and 40% at 1.4 (sd 0.9).</p>
    </div>
  );
}
