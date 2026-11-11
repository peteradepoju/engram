"use client";

import { useMemo, useState } from "react";
import { poisson, rng, Slider, Stat } from "./util";

const NC = 20, L = 100, NB = 100;

/** Twenty place cells on a 100 cm track: their fields, one window of spike counts at a chosen position, and the resulting posterior over position (flat prior). */
export function BayesDecoder() {
  const [x, setX] = useState(37);
  const [win, setWin] = useState(0.25);
  const [seed, setSeed] = useState(1);
  const cells = useMemo(() => {
    const r = rng(1998);
    return Array.from({ length: NC }, () => ({ c: r() * L, w: 5 + 7 * r(), p: 3 + 9 * r() }));
  }, []);
  const f = (c: { c: number; w: number; p: number }, pos: number) => 0.3 + c.p * Math.exp(-0.5 * ((pos - c.c) / c.w) ** 2);
  const { counts, post, est, sd } = useMemo(() => {
    const r = rng(seed * 7919 + Math.round(x * 10) + Math.round(win * 1000) * 13);
    const counts = cells.map((c) => poisson(f(c, x) * win, r));
    const lp = Array.from({ length: NB }, (_, b) => {
      const pos = (b + 0.5) * (L / NB);
      return cells.reduce((s, c, i) => s + counts[i] * Math.log(f(c, pos)) - win * f(c, pos), 0);
    });
    const m = Math.max(...lp), p = lp.map((v) => Math.exp(v - m)), z = p.reduce((a, b) => a + b, 0), post = p.map((v) => v / z);
    const est = (post.indexOf(Math.max(...post)) + 0.5) * (L / NB);
    const mean = post.reduce((s, v, b) => s + v * (b + 0.5) * (L / NB), 0);
    const sd = Math.sqrt(post.reduce((s, v, b) => s + v * ((b + 0.5) * (L / NB) - mean) ** 2, 0));
    return { counts, post, est, sd };
  }, [cells, x, win, seed]);
  const W = 360, sx = (p: number) => 10 + (p / L) * 340, pmax = Math.max(...post);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 230`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Place fields, spike counts and the posterior over position">
        <text x="10" y="12" fontSize="9" fill="var(--ink-3)">place fields (counts in this window above each field that fired)</text>
        {cells.map((c, i) => (
          <polyline key={i} points={Array.from({ length: 51 }, (_, k) => { const p = k * 2; return `${sx(p)},${100 - f(c, p) * 6}`; }).join(" ")} fill="none" stroke={counts[i] > 0 ? "var(--neuro)" : "var(--ink-3)"} strokeWidth={counts[i] > 0 ? 1.6 : 0.8} opacity={counts[i] > 0 ? 0.9 : 0.35} />
        ))}
        {cells.map((c, i) => counts[i] > 0 ? <text key={`n${i}`} x={sx(c.c)} y={100 - f(c, c.c) * 6 - 3} fontSize="8" textAnchor="middle" fill="var(--neuro)">{counts[i]}</text> : null)}
        <line x1="10" x2="350" y1="104" y2="104" stroke="var(--line)" />
        <text x="10" y="126" fontSize="9" fill="var(--ink-3)">posterior over position</text>
        <polyline points={post.map((v, b) => `${sx((b + 0.5) * (L / NB))},${215 - (v / pmax) * 80}`).join(" ")} fill="none" stroke="var(--ai)" strokeWidth="2" />
        <line x1="10" x2="350" y1="215" y2="215" stroke="var(--line)" />
        <line x1={sx(x)} x2={sx(x)} y1="20" y2="218" stroke="var(--ink)" strokeDasharray="3 3" />
        <text x={sx(x) + 3} y="226" fontSize="8" fill="var(--ink-2)">true position</text>
      </svg>
      <Slider label="true position" value={x} min={0} max={100} step={1} onChange={setX} unit="cm" />
      <Slider label="window length" value={win} min={0.02} max={1} step={0.02} onChange={setWin} fmt={(v) => `${Math.round(v * 1000)}`} unit="ms" />
      <button className="btn !py-1.5" onClick={() => setSeed((s) => s + 1)}>new window of spikes</button>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="spikes" value={`${counts.reduce((a, b) => a + b, 0)}`} />
        <Stat label="decoded" value={`${est.toFixed(0)} cm`} />
        <Stat label="posterior spread" value={`${sd.toFixed(1)} cm`} />
      </div>
      <p className="text-sm text-ink-2">Cells that fired in this window are drawn in colour, with their counts. Each spike adds the logarithm of its cell's field to the posterior, and every silent cell pushes the posterior away from its own field. With a 20 ms window there may be no spikes at all, and the posterior is broad, shaped only by where silence is most likely. Lengthen the window and it narrows around the true position, sometimes with a second peak where two fields overlap.</p>
    </div>
  );
}
