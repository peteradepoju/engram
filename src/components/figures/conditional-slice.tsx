"use client";

import { useMemo, useState } from "react";
import { useSvgDrag } from "./drag";
import { Slider, Stat } from "./util";

/** A joint distribution of two neurons' spike counts (with a shared gain). Slice it at one count of neuron A to see the conditional distribution of neuron B. */
export function ConditionalSlice() {
  const [shared, setShared] = useState(0.6);
  const [a, setA] = useState(2);
  const N = 12;
  const joint = useMemo(() => {
    // Mixture over a gain g with mean 1: P(a, b) = sum_g w(g) Pois(a; 3g) Pois(b; 4g)
    const gains = Array.from({ length: 41 }, (_, i) => 0.05 + (i / 40) * 2.4);
    const sd = Math.max(shared, 0.02);
    const w = gains.map((g) => Math.exp(-((g - 1) ** 2) / (2 * sd * sd)));
    const ws = w.reduce((x, y) => x + y, 0);
    const pois = (k: number, l: number) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
    const J = Array.from({ length: N }, () => new Array(N).fill(0));
    gains.forEach((g, gi) => { for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) J[i][j] += (w[gi] / ws) * pois(i, 3 * g) * pois(j, 4 * g); });
    const tot = J.flat().reduce((x, y) => x + y, 0);
    return J.map((r) => r.map((v) => v / tot));
  }, [shared]);
  const pa = joint.map((r) => r.reduce((x, y) => x + y, 0));
  const pb = joint[0].map((_, j) => joint.reduce((s, r) => s + r[j], 0));
  const cond = joint[a].map((v) => v / pa[a]);
  const mean = (p: number[]) => p.reduce((s, v, k) => s + v * k, 0);
  const W = 360, G = 220, cell = G / N, x0 = 40, y0 = 10;
  const top = Math.max(...joint.flat());
  const drag = useSvgDrag((_, x) => setA(Math.max(0, Math.min(N - 1, Math.floor((x - x0) / cell)))));
  const barMax = Math.max(...cond, ...pb);
  return (
    <div className="space-y-3">
      <svg ref={drag.ref} {...drag.svgProps} viewBox={`0 0 ${W} 316`} className="mx-auto w-full max-w-[420px] rounded-lg bg-surface-2" role="img" aria-label="Joint distribution of two spike counts with a conditional slice">
        {joint.map((r, i) => r.map((v, j) => (
          <rect key={`${i}-${j}`} x={x0 + i * cell} y={y0 + (N - 1 - j) * cell} width={cell + 0.5} height={cell + 0.5} shapeRendering="crispEdges" fill="var(--accent)" opacity={0.04 + 0.9 * Math.sqrt(v / top)} />
        )))}
        <rect x={x0 + a * cell} y={y0} width={cell} height={G} fill="none" stroke="var(--neuro)" strokeWidth="2.5" {...drag.handle("a")} />
        <text x={x0 + G / 2} y={y0 + G + 13} fontSize="10" textAnchor="middle" fill="var(--ink-3)">neuron A count (drag the pink column)</text>
        <text x="14" y={y0 + G / 2} fontSize="11" textAnchor="middle" fill="var(--ink-3)" transform={`rotate(-90 14 ${y0 + G / 2})`}>neuron B count</text>
        {/* conditional (pink) against marginal (grey) of B, as horizontal bars */}
        {pb.map((v, j) => (
          <g key={j}>
            <rect x={x0 + G + 10} y={y0 + (N - 1 - j) * cell + 2} width={(v / barMax) * (W - x0 - G - 16)} height={cell * 0.38} fill="var(--ink-3)" opacity="0.5" />
            <rect x={x0 + G + 10} y={y0 + (N - 1 - j) * cell + 2 + cell * 0.42} width={(cond[j] / barMax) * (W - x0 - G - 16)} height={cell * 0.38} fill="var(--neuro)" />
          </g>
        ))}
        <text x={x0 + G + 10} y={y0 + G + 16} fontSize="10" fill="var(--ink-3)">P(B) grey</text>
        <text x={x0 + G + 10} y={y0 + G + 30} fontSize="10" fill="var(--neuro)">P(B | A = {a}) pink</text>
        {pa.map((v, i) => { const h = (v / Math.max(...pa)) * 44; return <rect key={i} x={x0 + i * cell + 2} y={296 - h} width={cell - 4} height={h} fill="var(--ai)" opacity="0.7" />; })}
        <text x={x0} y={311} fontSize="10" fill="var(--ai)">P(A), the marginal of neuron A</text>
      </svg>
      <Slider label="shared gain fluctuation (0 means independent)" value={shared} min={0} max={0.8} step={0.02} onChange={setShared} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="E[B]" value={mean(pb).toFixed(2)} />
        <Stat label={`E[B | A = ${a}]`} value={mean(cond).toFixed(2)} />
        <Stat label="P(A = a)" value={pa[a].toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">The square shows the joint probability of every pair of counts (deeper colour means more probable). Fixing neuron A&apos;s count picks out one column; dividing that column by its total, P(A = a), gives the conditional distribution of B. With a shared gain, a high count from A shifts B&apos;s conditional distribution up: the two are dependent. Set the gain fluctuation to zero and every column has the same shape as the marginal, which is what independence means.</p>
    </div>
  );
}
