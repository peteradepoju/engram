"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Recall error distributions under slot and resource models of working memory. */
export function CapacityModels() {
  const [N, setN] = useState(4);
  const [K, setK] = useState(3);
  const hists = useMemo(() => {
    const r = rng(2008), g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const sd1 = (15 * Math.PI) / 180, n = 4000, nb = 36;
    const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
    const bin = (xs: number[]) => { const h = new Array(nb).fill(0); xs.forEach((x) => h[Math.min(nb - 1, Math.floor(((x + Math.PI) / (2 * Math.PI)) * nb))]++); return h; };
    const slots = Array.from({ length: n }, () => (r() < Math.min(1, K / N) ? sd1 * g() : -Math.PI + 2 * Math.PI * r()));
    const res = Array.from({ length: n }, () => wrap(sd1 * Math.sqrt(N) * g()));
    return { slots: bin(slots), res: bin(res) };
  }, [N, K]);
  const m = Math.max(...hists.slots, ...hists.res);
  const panel = (h: number[], ox: number, col: string, label: string) => (
    <g>
      {h.map((c, i) => <rect key={i} x={ox + i * 4.4} y={150 - (c / m) * 120} width="4" height={(c / m) * 120} fill={col} opacity="0.8" />)}
      <line x1={ox} x2={ox + 158} y1="150" y2="150" stroke="var(--line)" />
      <text x={ox + 79} y="166" fontSize="8" textAnchor="middle" fill="var(--ink-3)">−180°   error   180°</text>
      <text x={ox} y="20" fontSize="9" fill={col}>{label}</text>
    </g>
  );
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 172" className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Recall error distributions">
        {panel(hists.slots, 12, "var(--neuro)", "slots")}
        {panel(hists.res, 190, "var(--ai)", "resource")}
      </svg>
      <Slider label="number of items" value={N} min={1} max={8} step={1} onChange={setN} />
      <Slider label="number of slots (slot model)" value={K} min={1} max={6} step={1} onChange={setK} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="slots: guess rate" value={Math.max(0, 1 - K / N).toFixed(2)} />
        <Stat label="resource: error sd" value={`${(15 * Math.sqrt(N)).toFixed(0)}°`} />
      </div>
      <p className="text-sm text-ink-2">With more items than slots, the slot model keeps a sharp peak but adds a flat floor of guesses. The resource model has no floor, but its peak widens as precision is shared among more items.</p>
    </div>
  );
}
