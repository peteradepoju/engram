"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** The Metropolis algorithm sampling a correlated two-dimensional posterior. The proposal width decides how well it explores. */
export function MetropolisWalk() {
  const [width, setWidth] = useState(0.5);
  const [steps, setSteps] = useState(300);
  const [seed, setSeed] = useState(1);
  const rho = 0.9;
  const logp = (x: number, y: number) => -(x * x - 2 * rho * x * y + y * y) / (2 * (1 - rho * rho));
  const chain = useMemo(() => {
    const r = rng(seed * 101 + 7), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
    let x = -2.5, y = 2.5, acc = 0;
    const pts: number[][] = [[x, y]];
    for (let i = 0; i < 2000; i++) {
      const nx = x + width * g(), ny = y + width * g();
      if (Math.log(r()) < logp(nx, ny) - logp(x, y)) { x = nx; y = ny; acc++; }
      pts.push([x, y]);
    }
    return { pts, accRate: acc / 2000 };
  }, [width, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = chain.pts.slice(0, steps + 1);
  const W = 340, C = W / 2, K = 50, P = (u: number, v: number) => [C + u * K, C - v * K];
  const ell = (c: number) => Array.from({ length: 121 }, (_, i) => { const t = (i / 120) * 2 * Math.PI; const u = Math.cos(t), v = Math.sin(t); const a = Math.sqrt(c * (1 + rho)), b = Math.sqrt(c * (1 - rho)); const x = (a * u - b * v) / Math.SQRT2, y = (a * u + b * v) / Math.SQRT2; return P(x, y).join(","); }).join(" ");
  const kept = shown.slice(Math.min(50, shown.length - 1));
  const mx = kept.reduce((s, p) => s + p[0], 0) / kept.length;
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[340px] justify-self-center overflow-hidden rounded-lg bg-surface-2" role="img" aria-label="A Metropolis chain on a correlated posterior">
        {[1, 4, 9].map((c) => <polygon key={c} points={ell(c)} fill="none" stroke="var(--accent)" opacity="0.5" />)}
        <polyline points={shown.map(([u, v]) => P(u, v).join(",")).join(" ")} fill="none" stroke="var(--neuro)" strokeWidth="1" opacity="0.7" />
        {shown.map(([u, v], i) => i % 2 === 0 ? <circle key={i} cx={P(u, v)[0]} cy={P(u, v)[1]} r="1.6" fill="var(--neuro)" /> : null)}
        <circle cx={P(-2.5, 2.5)[0]} cy={P(-2.5, 2.5)[1]} r="5" fill="var(--warn)" />
        <text x="8" y="16" fontSize="10" fill="var(--warn)">start</text>
        <text x={W - 8} y="16" fontSize="10" textAnchor="end" fill="var(--accent)">posterior contours</text>
      </svg>
      <div className="space-y-3">
        <Slider label="proposal width" value={width} min={0.05} max={4} step={0.05} onChange={setWidth} fmt={(v) => v.toFixed(2)} />
        <Slider label="steps shown" value={steps} min={10} max={2000} step={10} onChange={setSteps} />
        <button className="btn !py-1.5" onClick={() => setSeed(seed + 1)}>New chain</button>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="acceptance rate" value={chain.accRate.toFixed(2)} />
          <Stat label="mean of x after 50 steps (truth 0)" value={mx.toFixed(2)} />
        </div>
        <p className="text-sm text-ink-2">The target is a posterior over two strongly correlated parameters. Each step proposes a random jump and accepts it with probability min(1, p(new)/p(old)); a rejected proposal repeats the current point. Tiny jumps are almost always accepted but crawl, so the chain takes many steps to forget where it started; huge jumps are almost always rejected, so it sits still. In between, the chain wanders over the whole posterior, and its points become samples from it.</p>
      </div>
    </div>
  );
}
