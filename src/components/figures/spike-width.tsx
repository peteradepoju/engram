"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

/** Extracellular waveforms of narrow-spiking (putative fast-spiking interneurons) and broad-spiking (putative pyramidal) units, classified by trough-to-peak width. */
export function SpikeWidth() {
  const [cut, setCut] = useState(0.45);
  const { units } = useMemo(() => {
    const r = rng(2018), g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    const units = Array.from({ length: 160 }, (_, i) => {
      const narrow = i < 40;
      const width = Math.max(0.15, (narrow ? 0.3 : 0.65) + (narrow ? 0.05 : 0.09) * g());
      return { narrow, width };
    });
    return { units };
  }, []);
  const wave = (w: number) => Array.from({ length: 60 }, (_, k) => { const t = k / 40 - 0.4; return -Math.exp(-(t ** 2) / 0.006) + 0.35 * Math.exp(-((t - w) ** 2) / (0.02 + w * 0.04)); });
  const W = 360, H = 200;
  const bins = Array.from({ length: 24 }, (_, b) => units.filter((u) => u.width >= 0.1 + b * 0.04 && u.width < 0.14 + b * 0.04));
  const BX = (w: number) => 180 + ((w - 0.1) / 0.96) * 170, maxc = Math.max(...bins.map((b) => b.length));
  const tp = units.filter((u) => u.narrow && u.width < cut).length, fp = units.filter((u) => !u.narrow && u.width < cut).length;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Example narrow and broad spike waveforms and a histogram of spike widths">
        {[0.3, 0.65].map((w, i) => <polyline key={i} points={wave(w).map((v, k) => `${14 + k * 2.5},${80 - v * 50}`).join(" ")} fill="none" stroke={i ? "var(--neuro)" : "var(--ai)"} strokeWidth="2" />)}
        <text x="14" y="20" fontSize="9" fill="var(--ai)">narrow (fast-spiking?)</text>
        <text x="14" y="32" fontSize="9" fill="var(--neuro)">broad (pyramidal?)</text>
        <text x="14" y={H - 10} fontSize="9" fill="var(--ink-3)">about 1.5 ms of waveform</text>
        {bins.map((b, i) => { const n = b.filter((u) => u.narrow).length, m = b.length - n, x = BX(0.1 + i * 0.04), bw = 170 / 24 - 1, sc = 120 / maxc;
          return <g key={i}><rect x={x} y={H - 24 - b.length * sc} width={bw} height={m * sc} fill="var(--neuro)" /><rect x={x} y={H - 24 - n * sc} width={bw} height={n * sc} fill="var(--ai)" /></g>; })}
        <line x1={BX(cut)} x2={BX(cut)} y1="20" y2={H - 24} stroke="var(--warn)" strokeDasharray="3 3" />
        <text x={BX(cut) + 3} y="30" fontSize="9" fill="var(--warn)">cut</text>
        <text x={W - 10} y={H - 8} fontSize="9" textAnchor="end" fill="var(--ink-3)">trough-to-peak width (ms)</text>
      </svg>
      <Slider label="classification threshold" value={cut} min={0.2} max={0.8} step={0.01} onChange={setCut} unit="ms" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="true narrow units caught" value={`${tp} of 40`} />
        <Stat label="broad units misclassified" value={`${fp} of 120`} />
      </div>
      <p className="text-sm text-ink-2">Simulated units, one quarter narrow-spiking. Fast-spiking parvalbumin interneurons tend to have brief action potentials, so extracellular recordings often split units by waveform width. The split is useful but imperfect: the distributions overlap, some pyramidal cells (for example in motor cortex) have narrow spikes, and other interneuron types are broad. A cell type defined by one feature is a hypothesis to check against others.</p>
    </div>
  );
}
