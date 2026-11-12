"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

const D = 20, M = 120;

/** A small fly hash: 20 input channels, 120 Kenyon cells each sampling k random inputs, winner-take-all keeping the top few; overlap of active cells for a reference odour, a similar odour and a different one. */
export function FlyHash() {
  const [k, setK] = useState(6);
  const [top, setTop] = useState(12);
  const [sim, setSim] = useState(0.8);
  const { tags, inputs } = useMemo(() => {
    const r = rng(2017);
    const conn = Array.from({ length: M }, () => { const s = new Set<number>(); while (s.size < k) s.add(Math.floor(r() * D)); return [...s]; });
    const base = Array.from({ length: D }, () => -Math.log(Math.max(r(), 1e-9)));
    const other = Array.from({ length: D }, () => -Math.log(Math.max(r(), 1e-9)));
    const near = base.map((v, i) => sim * v + (1 - sim) * other[(i * 7) % D]);
    const norm = (v: number[]) => { const m = v.reduce((a, b) => a + b, 0) / D; return v.map((x) => x / m - 1); };
    const inputs = [norm(base), norm(near), norm(other)];
    const tags = inputs.map((x) => {
      const y = conn.map((c) => c.reduce((s, i) => s + x[i], 0));
      const thr = [...y].sort((a, b) => b - a)[top - 1];
      return y.map((v) => v >= thr);
    });
    return { tags, inputs };
  }, [k, top, sim]);
  const overlap = (a: boolean[], b: boolean[]) => a.filter((v, i) => v && b[i]).length;
  const names = ["odour A", "similar to A", "different odour"], cols = ["var(--ai)", "var(--good)", "var(--neuro)"];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 170" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Input patterns and Kenyon cell tags for three odours">
        {inputs.map((x, o) => (
          <g key={o}>
            <text x="8" y={22 + o * 52} fontSize="9" fill={cols[o]}>{names[o]}</text>
            {x.map((v, i) => <rect key={i} x={8 + i * 4} y={50 + o * 52 - Math.max(0, v) * 10} width="3" height={Math.max(0.5, Math.max(0, v) * 10)} fill={cols[o]} opacity="0.7" />)}
            {tags[o].map((on, j) => <rect key={`t${j}`} x={100 + (j % 60) * 4.2} y={28 + o * 52 + Math.floor(j / 60) * 12} width="3.4" height="10" fill={on ? cols[o] : "var(--line)"} />)}
          </g>
        ))}
        <text x="100" y="12" fontSize="9" fill="var(--ink-3)">Kenyon cells (coloured = among the most active)</text>
      </svg>
      <Slider label="inputs per Kenyon cell" value={k} min={1} max={20} step={1} onChange={setK} />
      <Slider label="cells kept by winner-take-all" value={top} min={2} max={40} step={1} onChange={setTop} />
      <Slider label="similarity of the second odour to A" value={sim} min={0} max={1} step={0.05} onChange={setSim} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="shared cells, A and similar" value={`${overlap(tags[0], tags[1])} of ${top}`} />
        <Stat label="shared cells, A and different" value={`${overlap(tags[0], tags[2])} of ${top}`} />
      </div>
      <p className="text-sm text-ink-2">The bars on the left are the normalised input channels; the grid on the right is 120 Kenyon cells, coloured if they are among the most active. Similar inputs light up many of the same cells, and different ones few. Set the inputs per cell to 1 and each cell just copies a channel; set it to 20 and every cell sums everything, so the tag is decided by tiny differences.</p>
    </div>
  );
}
