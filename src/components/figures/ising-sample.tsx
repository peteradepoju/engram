"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const N = 32;

/** Gibbs sampling of a two-dimensional Ising model: as the coupling grows, local agreement turns into global order. */
export function IsingSample() {
  const [J, setJ] = useState(0.3);
  const [h, setH] = useState(0);
  const res = useMemo(() => {
    const r = rng(623), s = Array.from({ length: N * N }, () => (r() < 0.5 ? 1 : -1));
    const at = (i: number, j: number): number => s[((i + N) % N) * N + ((j + N) % N)];
    for (let sweep = 0; sweep < 150; sweep++) {
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const field = J * (at(i - 1, j) + at(i + 1, j) + at(i, j - 1) + at(i, j + 1)) + h;
        s[i * N + j] = r() < 1 / (1 + Math.exp(-2 * field)) ? 1 : -1;
      }
    }
    let agree = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) agree += (at(i, j) * at(i, j + 1) + at(i, j) * at(i + 1, j)) / 2;
    return { s: s.slice(), m: s.reduce((a, b) => a + b, 0) / (N * N), c: agree / (N * N) };
  }, [J, h]);
  const cell = 150 / N;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 160" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Ising lattice">
        {res.s.map((v, k) => <rect key={k} x={95 + (k % N) * cell} y={5 + Math.floor(k / N) * cell} width={cell} height={cell} fill={v > 0 ? "var(--neuro)" : "var(--surface)"} />)}
      </svg>
      <Slider label="coupling J between neighbours" value={J} min={0} max={0.8} step={0.01} onChange={setJ} fmt={(v) => v.toFixed(2)} />
      <Slider label="external field h" value={h} min={-0.3} max={0.3} step={0.01} onChange={setH} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="mean state (magnetisation)" value={res.m.toFixed(3)} />
        <Stat label="neighbour correlation" value={res.c.toFixed(3)} />
      </div>
      <p className="text-sm text-ink-2">Each unit is on or off and prefers to agree with its four neighbours, with strength J. Below a critical coupling (about 0.44 for this lattice) agreement is local and patchy; above it, one state takes over the whole lattice. Only pairwise interactions are specified, yet large-scale collective states emerge: the idea behind Ising models of neural populations.</p>
    </div>
  );
}
