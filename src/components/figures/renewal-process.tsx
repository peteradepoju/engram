"use client";

import { useMemo, useState } from "react";
import { rng, Slider, Stat } from "./util";

function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r()); }

/** Gamma(k) variates by Marsaglia and Tsang, with the k below 1 boost. */
function gamma(k: number, r: () => number): number {
  if (k < 1) return gamma(k + 1, r) * Math.pow(Math.max(r(), 1e-12), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { x = gauss(r); v = 1 + c * x; } while (v <= 0);
    v = v * v * v; const u = r();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** Gamma renewal spike trains at 20 Hz: a raster, the interval histogram, the interval CV and the Fano factor of counts in 1 s windows. */
export function RenewalProcess() {
  const [lk, setLk] = useState(0);
  const k = 10 ** lk;
  const { isi, rows, fano } = useMemo(() => {
    const r = rng(34), isi = Array.from({ length: 4000 }, () => (gamma(k, r) * 50) / k);
    let t = 0; const spikes = isi.map((d) => (t += d));
    const rows = Array.from({ length: 8 }, (_, i) => spikes.filter((s) => s >= i * 1000 && s < (i + 1) * 1000).map((s) => s - i * 1000));
    const nW = Math.floor(t / 1000), counts = new Array(nW).fill(0);
    spikes.forEach((s) => { const w = Math.floor(s / 1000); if (w < nW) counts[w]++; });
    const m = counts.reduce((a, b) => a + b, 0) / nW, v = counts.reduce((a, b) => a + (b - m) ** 2, 0) / nW;
    return { isi, rows, fano: v / m };
  }, [k]);
  const mean = isi.reduce((a, b) => a + b, 0) / isi.length;
  const cv = Math.sqrt(isi.reduce((a, b) => a + (b - mean) ** 2, 0) / isi.length) / mean;
  const bins = Array.from({ length: 30 }, (_, b) => isi.filter((d) => d >= b * 6 && d < (b + 1) * 6).length);
  const bmax = Math.max(...bins, 1);
  const W = 360, H = 220;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] rounded-lg bg-surface-2" role="img" aria-label="Raster and interval histogram of a renewal process">
        <text x="10" y="12" fontSize="9" fill="var(--ink-3)">eight seconds of spikes, one second per row</text>
        {rows.map((row, i) => row.map((s, j) => <line key={`${i}-${j}`} x1={10 + (s / 1000) * 340} x2={10 + (s / 1000) * 340} y1={18 + i * 11} y2={26 + i * 11} stroke="var(--neuro)" strokeWidth="1.2" />))}
        <text x="10" y="120" fontSize="9" fill="var(--ink-3)">interval histogram (0 to 180 ms)</text>
        {bins.map((n, b) => <rect key={b} x={10 + b * 11.3} y={210 - (n / bmax) * 80} width="10" height={(n / bmax) * 80} fill="var(--ai)" />)}
      </svg>
      <Slider label="shape k (1 = Poisson)" value={lk} min={-0.6} max={1.3} step={0.02} onChange={setLk} fmt={() => k.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="interval CV" value={cv.toFixed(2)} />
        <Stat label="CV²" value={(cv * cv).toFixed(2)} />
        <Stat label="Fano (1 s windows)" value={fano.toFixed(2)} />
      </div>
      <p className="text-sm text-ink-2">All settings fire at 20 Hz on average. With k above 1 the intervals cluster around 50 ms and the raster looks like a clock; with k below 1 short intervals and long gaps both become common, and spikes clump. The Fano factor of the counts follows CV², so regular intervals mean nearly constant counts.</p>
    </div>
  );
}
