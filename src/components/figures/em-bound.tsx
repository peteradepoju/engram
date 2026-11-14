"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const npdf = (x: number, m: number): number => Math.exp(-0.5 * (x - m) ** 2) / Math.sqrt(2 * Math.PI);

/** EM as coordinate ascent: at each iteration a lower bound touches the log-likelihood and its maximum gives the next parameter. */
export function EmBound() {
  const [it, setIt] = useState(0);
  const data = useMemo(() => { const r = rng(632); return Array.from({ length: 80 }, (_, i): number => (i < 40 ? -1 + gauss(r) : 2.5 + gauss(r))); }, []);
  const ll = (m2: number): number => data.reduce((s, x) => s + Math.log(0.5 * npdf(x, -1) + 0.5 * npdf(x, m2)), 0);
  const mus = useMemo(() => { const out = [-2.5]; for (let k = 0; k < 8; k++) { const m = out[out.length - 1]; const r2 = data.map((x) => (0.5 * npdf(x, m)) / (0.5 * npdf(x, -1) + 0.5 * npdf(x, m))); out.push(data.reduce((s, x, i) => s + r2[i] * x, 0) / r2.reduce((a, b) => a + b, 0)); } return out; }, [data]);
  const m0 = mus[it];
  const r2 = data.map((x) => (0.5 * npdf(x, m0)) / (0.5 * npdf(x, -1) + 0.5 * npdf(x, m0)));
  const bound = (m2: number): number => data.reduce((s, x, i) => {
    const a = 1 - r2[i], b = r2[i];
    return s + (a > 1e-12 ? a * (Math.log(0.5 * npdf(x, -1)) - Math.log(a)) : 0) + (b > 1e-12 ? b * (Math.log(0.5 * npdf(x, m2)) - Math.log(b)) : 0);
  }, 0);
  const grid = Array.from({ length: 121 }, (_, i): number => -3 + i * 0.05);
  const L = grid.map(ll), B = grid.map(bound);
  const lo = Math.min(...L) - 5, hi = Math.max(...L) + 5;
  const sx = (m: number): number => 20 + ((m + 3) / 6) * 300, sy = (v: number): number => 145 - ((Math.max(v, lo) - lo) / (hi - lo)) * 130;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="EM lower bound">
        <polyline points={grid.map((m, i) => `${sx(m)},${sy(L[i])}`).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="2" />
        <polyline points={grid.map((m, i) => `${sx(m)},${sy(B[i])}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" strokeDasharray="5 3" />
        <line x1={sx(m0)} x2={sx(m0)} y1="10" y2="145" stroke="var(--ink-3)" strokeDasharray="2 3" />
        <line x1={sx(mus[it + 1] ?? m0)} x2={sx(mus[it + 1] ?? m0)} y1="10" y2="145" stroke="var(--ai)" strokeWidth="1" />
        <text x="24" y="14" fontSize="8" fill="var(--neuro)">log-likelihood of the second mean</text>
        <text x="200" y="14" fontSize="8" fill="var(--ai)">lower bound from this E step</text>
      </svg>
      <Slider label="EM iteration" value={it} min={0} max={7} step={1} onChange={setIt} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="current mean" value={m0.toFixed(3)} />
        <Stat label="next mean (bound's maximum)" value={(mus[it + 1] ?? m0).toFixed(3)} />
        <Stat label="log-likelihood" value={ll(m0).toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">The E step builds a lower bound on the log-likelihood that touches it at the current parameter (dotted line). The M step jumps to the bound's maximum (solid line), which can only raise the log-likelihood. Repeating climbs to a local maximum: the true second mean is 2.5.</p>
    </div>
  );
}
