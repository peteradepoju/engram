"use client";

import { useMemo, useState } from "react";
import { gauss, rng, Slider, Stat } from "./util";

const TYPES = [
  { name: "narrow", width: 0.25, ratio: 0.7, col: "var(--neuro)" },
  { name: "broad", width: 0.55, ratio: 0.35, col: "var(--ai)" },
  { name: "intermediate", width: 0.4, ratio: 0.55, col: "var(--accent)" },
];

/** Spike waveforms of three putative types, and how spread within types blurs the clusters. */
export function WaveformClusters() {
  const [spread, setSpread] = useState(0.4);
  const cells = useMemo(() => {
    const r = rng(605);
    return Array.from({ length: 150 }, (_, i) => {
      const t = TYPES[i % 3];
      return { k: i % 3, width: t.width + spread * 0.08 * gauss(r), ratio: t.ratio + spread * 0.1 * gauss(r) };
    });
  }, [spread]);
  const correct = cells.filter((c) => {
    let b = 0, bd = Infinity;
    TYPES.forEach((t, k) => { const d = ((c.width - t.width) / 0.08) ** 2 + ((c.ratio - t.ratio) / 0.1) ** 2; if (d < bd) { bd = d; b = k; } });
    return b === c.k;
  }).length / cells.length;
  const wave = (w: number, ratio: number) => Array.from({ length: 60 }, (_, i) => { const t = i / 60 * 1.6 - 0.3; return -Math.exp(-0.5 * (t / 0.08) ** 2) + ratio * Math.exp(-0.5 * ((t - w) / (w * 0.6)) ** 2); });
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 340 170" className="mx-auto w-full max-w-[480px] rounded-lg bg-surface-2" role="img" aria-label="Waveforms and feature scatter">
        {TYPES.map((t, k) => <polyline key={k} points={wave(t.width, t.ratio).map((v, i) => `${15 + i * 2.2},${70 - v * 45}`).join(" ")} fill="none" stroke={t.col} strokeWidth="2" />)}
        <text x="15" y="160" fontSize="8" fill="var(--ink-3)">mean waveform of each type</text>
        <rect x="170" y="10" width="160" height="140" fill="none" stroke="var(--line)" />
        {cells.map((c, i) => <circle key={i} cx={170 + ((c.width - 0.05) / 0.7) * 160} cy={150 - ((c.ratio - 0.1) / 0.8) * 140} r="2.2" fill={TYPES[c.k].col} opacity="0.8" />)}
        <text x="250" y="162" fontSize="8" textAnchor="middle" fill="var(--ink-3)">trough-to-peak time</text>
        <text x="166" y="80" fontSize="8" textAnchor="middle" fill="var(--ink-3)" transform="rotate(-90 166 80)">peak / trough</text>
      </svg>
      <Slider label="variability within each type" value={spread} min={0} max={2} step={0.05} onChange={setSpread} fmt={(v) => v.toFixed(2)} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="cells assigned to their own type by the nearest type mean" value={`${(100 * correct).toFixed(0)}%`} />
        <Stat label="clusters visible?" value={spread < 0.6 ? "clearly" : spread < 1.1 ? "partly" : "no: a continuum"} />
      </div>
      <p className="text-sm text-ink-2">Two features of the extracellular spike, its trough-to-peak time and the height of its after-peak, separate narrow-spiking from broad-spiking cells when types are distinct. As variability within types grows, the clouds merge into a continuum and even the true types cannot be recovered from these features: a clustering algorithm will still return clusters.</p>
    </div>
  );
}
